/**
 * dsh-diff-stat — host half (M4).
 *
 * A fenced read/mutation API for the browser half, served on this plugin's own
 * prefix route (the same webServer pattern the super-injector's manager uses):
 *
 *   POST /dsh-diff-stat/api/files.read  { cwd, path }
 *   POST /dsh-diff-stat/api/undo        { cwd, files }
 *   POST /dsh-diff-stat/api/open-with   { cwd, path, target }
 *   GET  /dsh-diff-stat/api/ping
 *
 * Fence semantics follow dsh-file-review: every path resolves against the
 * session workspace root with realpath containment (checked before AND after
 * resolution, so symlinks cannot smuggle a path out), symlinks are rejected,
 * only regular files are touched, text is validated by a UTF-8 round-trip,
 * reads cap at 512 KiB with an explicit truncated flag, and undo applies a
 * hunk chain in memory first — any drift (expected text absent or ambiguous)
 * rejects the whole file before a byte is written. Writes go through
 * writeFileAtomic; creates made by a turn are undone by deleting the file.
 *
 * Trust model: this route is same-origin and unauthenticated, exactly like
 * every other plugin-served Web API — it must not be more powerful than the
 * page that calls it. undo/open-with exist for user-clicked card actions only.
 */
import { spawn } from 'node:child_process';
import { readFile, lstat, realpath, unlink } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write';
export const name = 'dsh-diff-stat';
/** The webServer service hosts this plugin's fenced prefix route. */
export const inject = ['webServer'];
/** The plugin's own API prefix (package name; '/'-safe in a URL path). */
const API_PREFIX = '/dsh-diff-stat/api';
/** Read cap in bytes; larger text files answer with truncated: true. */
const READ_CAP = 512 * 1024;
/** Request body cap — undo payloads carry hunks, so allow a few MiB. */
const BODY_CAP = 4 * 1024 * 1024;
/** Path containment: candidate is root itself or below it (no .. escape). */
function inside(root, candidate) {
    const child = relative(root, candidate);
    return child === '' || (!child.startsWith('..') && !isAbsolute(child));
}
/**
 * Resolve a requested path inside the workspace with the full fence: realpath
 * the root, contain the candidate, reject symlinks and non-files, re-contain
 * the resolved path, then validate UTF-8 by round-trip.
 */
async function resolveFile(cwd, requestedPath) {
    if (typeof cwd !== 'string' || cwd === '')
        throw new Error('cwd is required');
    if (typeof requestedPath !== 'string' || requestedPath === '')
        throw new Error('path is required');
    const root = await realpath(cwd);
    const candidate = resolve(root, requestedPath);
    if (!inside(root, candidate))
        throw new Error('path is outside the session workspace');
    const linkStat = await lstat(candidate);
    if (linkStat.isSymbolicLink())
        throw new Error('symbolic links are not supported');
    if (!linkStat.isFile())
        throw new Error('path is not a regular file');
    const filename = await realpath(candidate);
    if (!inside(root, filename))
        throw new Error('resolved path is outside the session workspace');
    const bytes = await readFile(filename);
    const text = bytes.toString('utf8');
    if (!Buffer.from(text, 'utf8').equals(bytes))
        throw new Error('file is not valid UTF-8 text');
    return { filename, mode: linkStat.mode & 0o777, bytes, text };
}
/**
 * Replace the ONE occurrence of source with replacement, or null when the
 * text drifted (source absent, or present more than once — ambiguity means
 * we are not looking at the file the turn produced).
 */
function replaceUnique(text, source, replacement) {
    if (source === '')
        return null;
    const at = text.indexOf(source);
    if (at === -1)
        return null;
    if (text.indexOf(source, at + 1) !== -1)
        return null;
    return text.slice(0, at) + replacement + text.slice(at + source.length);
}
/**
 * Undo one file's hunk chain in memory: peel edits in reverse settlement
 * order (applied text → prior text, uniqueness-checked), and when the chain
 * bottoms out at a create (oldText null), require the peeled text to equal
 * the created content exactly, then delete. Returns the file's outcome.
 */
async function undoFile(cwd, file) {
    try {
        if (!Array.isArray(file.diffs) || file.diffs.length === 0) {
            return { path: file.path, ok: false, error: 'no hunks recorded' };
        }
        const resolved = await resolveFile(cwd, file.path);
        let text = resolved.text;
        let created = false;
        for (let i = file.diffs.length - 1; i >= 0; i -= 1) {
            const hunk = file.diffs[i];
            if (hunk === undefined || typeof hunk.newText !== 'string') {
                return { path: file.path, ok: false, error: 'malformed hunk' };
            }
            if (hunk.oldText === null) {
                // The create that started this file's turn: everything after it must
                // peel back to exactly the created content, else the file drifted.
                if (text !== hunk.newText)
                    return { path: file.path, ok: false, error: 'file drifted from the recorded create' };
                created = true;
            }
            else if (typeof hunk.oldText !== 'string') {
                return { path: file.path, ok: false, error: 'malformed hunk' };
            }
            else {
                const next = replaceUnique(text, hunk.newText, hunk.oldText);
                if (next === null)
                    return { path: file.path, ok: false, error: 'file drifted: expected applied text not found or ambiguous' };
                text = next;
            }
        }
        if (created) {
            await unlink(resolved.filename);
            return { path: file.path, ok: true, deleted: true };
        }
        await writeFileAtomic(resolved.filename, text, { mode: resolved.mode });
        return { path: file.path, ok: true };
    }
    catch (error) {
        return { path: file.path, ok: false, error: String(error.message ?? error) };
    }
}
/** Spawn one of the two whitelisted openers; both are fire-and-forget. */
function openWith(cwd, requestedPath, target) {
    return new Promise((resolvePromise, rejectPromise) => {
        void (async () => {
            try {
                // Fence the path like every other endpoint: the opener must not
                // become a probe for paths outside the session workspace.
                const resolved = await resolveFile(cwd, requestedPath);
                if (target === 'explorer') {
                    // explorer /select,"<path>" reveals the file in its folder.
                    const child = spawn('explorer', ['/select,"' + resolved.filename + '"'], { detached: true, stdio: 'ignore' });
                    child.unref();
                    child.once('error', rejectPromise);
                    // explorer returns a nonzero/late exit by design; the spawn
                    // succeeding is the signal.
                    setTimeout(() => resolvePromise(), 300);
                }
                else if (target === 'vscode') {
                    if (requestedPath.includes('"')) {
                        rejectPromise(new Error('path contains a quote'));
                        return;
                    }
                    // code is a .cmd shim on Windows; shell: true resolves it.
                    const child = spawn('code "' + resolved.filename + '"', { shell: true, detached: true, stdio: 'ignore' });
                    child.unref();
                    child.once('error', rejectPromise);
                    setTimeout(() => resolvePromise(), 300);
                }
                else {
                    rejectPromise(new Error('unknown open-with target'));
                }
            }
            catch (error) {
                rejectPromise(error);
            }
        })();
    });
}
/** Read the request body with a hard cap; rejects oversized or non-JSON bodies. */
function readJsonBody(req) {
    return new Promise((resolvePromise, rejectPromise) => {
        const chunks = [];
        let size = 0;
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > BODY_CAP) {
                rejectPromise(new Error('request body too large'));
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
                if (parsed === null || typeof parsed !== 'object')
                    rejectPromise(new Error('body must be a JSON object'));
                else
                    resolvePromise(parsed);
            }
            catch (error) {
                rejectPromise(new Error('invalid JSON body: ' + String(error.message ?? error)));
            }
        });
        req.on('error', rejectPromise);
    });
}
/** Send one JSON response and end the request. */
function respond(res, status, payload) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}
export function apply(ctx) {
    const webServer = ctx.webServer;
    if (webServer === undefined) {
        // Host half is optional by design (client degrades: no 撤销/内嵌查看/定向打开).
        ctx.logger?.warn?.('[dsh-diff-stat] webServer service absent — fenced file API disabled');
        return;
    }
    ctx.effect(() => webServer.register({
        kind: 'prefix',
        path: API_PREFIX,
        handler: async (req, res) => {
            const route = (req.url ?? '/').split('?')[0];
            try {
                if (route === '/ping' || route === API_PREFIX + '/ping') {
                    respond(res, 200, { ok: true });
                    return;
                }
                if (req.method !== 'POST') {
                    respond(res, 405, { ok: false, error: 'POST only' });
                    return;
                }
                const action = route.startsWith(API_PREFIX + '/') ? route.slice(API_PREFIX.length + 1) : (route.startsWith('/') ? route.slice(1) : route);
                const body = await readJsonBody(req);
                if (action === 'files.read') {
                    const resolved = await resolveFile(String(body['cwd'] ?? ''), String(body['path'] ?? ''));
                    if (resolved.bytes.includes(0)) {
                        respond(res, 200, { kind: 'binary', truncated: false, size: resolved.bytes.length });
                        return;
                    }
                    const truncated = resolved.bytes.length > READ_CAP;
                    const content = truncated ? resolved.bytes.subarray(0, READ_CAP).toString('utf8') : resolved.text;
                    respond(res, 200, { kind: 'text', content, truncated, size: resolved.bytes.length });
                    return;
                }
                if (action === 'undo') {
                    const files = body['files'];
                    if (!Array.isArray(files)) {
                        respond(res, 200, { ok: false, error: 'files must be an array', results: [] });
                        return;
                    }
                    const results = [];
                    for (const file of files) {
                        results.push(await undoFile(String(body['cwd'] ?? ''), {
                            path: String(file.path ?? ''),
                            diffs: Array.isArray(file.diffs)
                                ? file.diffs.map(hunk => ({
                                    oldText: hunk === null || typeof hunk !== 'object' ? null : hunk.oldText ?? null,
                                    newText: hunk === null || typeof hunk !== 'object' ? '' : String(hunk.newText ?? ''),
                                }))
                                : [],
                        }));
                    }
                    respond(res, 200, { ok: results.every(r => r.ok), results });
                    return;
                }
                if (action === 'open-with') {
                    await openWith(String(body['cwd'] ?? ''), String(body['path'] ?? ''), body['target']);
                    respond(res, 200, { ok: true });
                    return;
                }
                respond(res, 404, { ok: false, error: 'unknown action' });
            }
            catch (error) {
                respond(res, 200, { ok: false, error: String(error.message ?? error) });
            }
        },
    }), 'dsh-diff-stat: fenced file api');
}
//# sourceMappingURL=index.js.map