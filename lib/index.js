import { spawn } from "node:child_process";
import { lstat, readFile, readdir, realpath, unlink } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
//#region src/undo-plan.ts
function snapshotProbeFrom(record) {
	if (record === void 0) return void 0;
	return { has: (path) => record.files.has(path) ? true : record.truncated ? void 0 : false };
}
function classifyCreate(snapshot, path) {
	if (snapshot === void 0) return "unverified";
	const existed = snapshot.has(path);
	if (existed === void 0) return "unverified";
	return existed ? "overwrite" : "create";
}
function createRefusalError(classification) {
	if (classification === "overwrite") return "file existed before the turn — write replaced it and the prior content cannot be restored; refusing to delete";
	return "no turn snapshot — cannot verify this file was created (not an overwrite); refusing to delete";
}
//#endregion
//#region src/index.ts
const name = "dsh-diff-stat";
const inject = ["webServer"];
const API_PREFIX = "/dsh-diff-stat/api";
const READ_CAP = 524288;
const BODY_CAP = 4194304;
async function assertSamePath(candidate, filename) {
	if (await realpath(candidate) !== filename) throw new Error("file changed while being accessed (link swap)");
}
function inside(root, candidate) {
	const child = relative(root, candidate);
	return child === "" || !child.startsWith("..") && !isAbsolute(child);
}
async function resolveFile(cwd, requestedPath) {
	if (typeof cwd !== "string" || cwd === "") throw new Error("cwd is required");
	if (typeof requestedPath !== "string" || requestedPath === "") throw new Error("path is required");
	const root = await realpath(cwd);
	const candidate = resolve(root, requestedPath);
	if (!inside(root, candidate)) throw new Error("path is outside the session workspace");
	const linkStat = await lstat(candidate);
	if (linkStat.isSymbolicLink()) throw new Error("symbolic links are not supported");
	if (!linkStat.isFile()) throw new Error("path is not a regular file");
	const filename = await realpath(candidate);
	if (!inside(root, filename)) throw new Error("resolved path is outside the session workspace");
	const bytes = await readFile(filename);
	await assertSamePath(candidate, filename);
	const text = bytes.toString("utf8");
	if (!Buffer.from(text, "utf8").equals(bytes)) throw new Error("file is not valid UTF-8 text");
	return {
		candidate,
		filename,
		mode: linkStat.mode & 511,
		bytes,
		text
	};
}
function replaceUnique(text, source, replacement) {
	if (source === "") return null;
	const at = text.indexOf(source);
	if (at === -1) return null;
	if (text.indexOf(source, at + 1) !== -1) return null;
	return text.slice(0, at) + replacement + text.slice(at + source.length);
}
async function undoFile(cwd, turn, file) {
	try {
		if (!Array.isArray(file.diffs) || file.diffs.length === 0) return {
			path: file.path,
			ok: false,
			error: "no hunks recorded"
		};
		const resolved = await resolveFile(cwd, file.path);
		let text = resolved.text;
		let created = false;
		for (let i = file.diffs.length - 1; i >= 0; i -= 1) {
			const hunk = file.diffs[i];
			if (hunk === void 0 || typeof hunk.newText !== "string") return {
				path: file.path,
				ok: false,
				error: "malformed hunk"
			};
			if (hunk.oldText === null) {
				if (text !== hunk.newText) return {
					path: file.path,
					ok: false,
					error: "file drifted from the recorded create"
				};
				const classification = classifyCreate(typeof turn === "number" ? snapshotProbe(cwd, turn) : void 0, resolved.filename);
				if (classification !== "create") return {
					path: file.path,
					ok: false,
					error: createRefusalError(classification)
				};
				created = true;
			} else if (typeof hunk.oldText !== "string") return {
				path: file.path,
				ok: false,
				error: "malformed hunk"
			};
			else {
				const next = replaceUnique(text, hunk.newText, hunk.oldText);
				if (next === null) return {
					path: file.path,
					ok: false,
					error: "file drifted: expected applied text not found or ambiguous"
				};
				text = next;
			}
		}
		await assertSamePath(resolved.candidate, resolved.filename);
		if (created) {
			await unlink(resolved.filename);
			return {
				path: file.path,
				ok: true,
				deleted: true
			};
		}
		await writeFileAtomic(resolved.filename, text, { mode: resolved.mode });
		return {
			path: file.path,
			ok: true
		};
	} catch (error) {
		return {
			path: file.path,
			ok: false,
			error: String(error.message ?? error)
		};
	}
}
function openWith(cwd, requestedPath, target) {
	return new Promise((resolvePromise, rejectPromise) => {
		(async () => {
			try {
				const resolved = await resolveFile(cwd, requestedPath);
				if (/["%]/.test(resolved.filename)) {
					rejectPromise(new Error("path contains a shell-special character (quote or %)"));
					return;
				}
				if (target === "explorer") {
					const child = spawn("explorer /select,\"" + resolved.filename + "\"", {
						shell: true,
						detached: true,
						stdio: "ignore"
					});
					child.unref();
					child.once("error", rejectPromise);
					setTimeout(() => resolvePromise(), 300);
				} else if (target === "vscode") {
					const child = spawn("code \"" + resolved.filename + "\"", {
						shell: true,
						detached: true,
						stdio: "ignore"
					});
					child.unref();
					child.once("error", rejectPromise);
					setTimeout(() => resolvePromise(), 300);
				} else rejectPromise(new Error("unknown open-with target"));
			} catch (error) {
				rejectPromise(error);
			}
		})();
	});
}
const SNAPSHOT_MAX_TURNS = 16;
const SNAPSHOT_MAX_FILES = 1e5;
const SNAPSHOT_SKIP_DIRS = new Set(["node_modules", ".git"]);
const turnSnapshots = new Map();
function snapshotKey(cwd, turn) {
	return cwd + "\0" + turn;
}
function snapshotProbe(cwd, turn) {
	return snapshotProbeFrom(turnSnapshots.get(snapshotKey(cwd, turn)));
}
async function captureSnapshot(cwd, turn) {
	if (typeof cwd !== "string" || cwd === "") return {
		ok: false,
		error: "cwd is required"
	};
	const turnNo = Number(turn);
	if (!Number.isInteger(turnNo) || turnNo < 1) return {
		ok: false,
		error: "turn is required"
	};
	let root;
	try {
		root = await realpath(cwd);
	} catch {
		return {
			ok: false,
			error: "workspace not resolved"
		};
	}
	const existingKey = snapshotKey(cwd, turnNo);
	if (turnSnapshots.has(existingKey)) return {
		ok: true,
		files: turnSnapshots.get(existingKey).files.size,
		truncated: turnSnapshots.get(existingKey).truncated
	};
	const files = new Set();
	let truncated = false;
	const walk = async (dir) => {
		if (truncated) return;
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (files.size >= SNAPSHOT_MAX_FILES) {
				truncated = true;
				return;
			}
			if (SNAPSHOT_SKIP_DIRS.has(entry.name)) continue;
			const full = join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
				continue;
			}
			if (entry.isFile()) files.add(full);
		}
	};
	await walk(root);
	turnSnapshots.set(existingKey, {
		at: Date.now(),
		files,
		truncated
	});
	while (turnSnapshots.size > SNAPSHOT_MAX_TURNS) {
		const oldest = turnSnapshots.keys().next().value;
		if (oldest === void 0) break;
		turnSnapshots.delete(oldest);
	}
	return {
		ok: true,
		files: files.size,
		truncated
	};
}
function readJsonBody(req, res) {
	return new Promise((resolvePromise, rejectPromise) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			size += chunk.length;
			if (size > BODY_CAP) {
				rejectPromise(new Error("request body too large"));
				res.writeHead(413, { "content-type": "application/json; charset=utf-8" });
				res.end(JSON.stringify({
					ok: false,
					error: "request body too large"
				}));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => {
			try {
				const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
				if (parsed === null || typeof parsed !== "object") rejectPromise(new Error("body must be a JSON object"));
				else resolvePromise(parsed);
			} catch (error) {
				rejectPromise(new Error("invalid JSON body: " + String(error.message ?? error)));
			}
		});
		req.on("error", rejectPromise);
	});
}
function utf8SafeSlice(bytes) {
	for (let back = 1; back <= 3 && back <= bytes.length; back += 1) {
		const byte = bytes[bytes.length - back];
		if (byte === void 0) break;
		if ((byte & 192) === 128) continue;
		if ((byte >= 240 ? 4 : byte >= 224 ? 3 : byte >= 192 ? 2 : 1) > back) return bytes.subarray(0, bytes.length - back);
		break;
	}
	return bytes;
}
function respond(res, status, payload) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(payload));
}
function apply(ctx) {
	const webServer = ctx.webServer;
	if (webServer === void 0) {
		ctx.logger?.warn?.("[dsh-diff-stat] webServer service absent — fenced file API disabled");
		return;
	}
	ctx.effect(() => webServer.register({
		kind: "prefix",
		path: API_PREFIX,
		handler: async (req, res) => {
			const route = (req.url ?? "/").split("?")[0];
			try {
				if (route === "/ping" || route === API_PREFIX + "/ping") {
					respond(res, 200, { ok: true });
					return;
				}
				if (req.method !== "POST") {
					respond(res, 405, {
						ok: false,
						error: "POST only"
					});
					return;
				}
				const action = route.startsWith(API_PREFIX + "/") ? route.slice(19) : route.startsWith("/") ? route.slice(1) : route;
				const body = await readJsonBody(req, res);
				if (action === "files.read") {
					const resolved = await resolveFile(String(body["cwd"] ?? ""), String(body["path"] ?? ""));
					if (resolved.bytes.includes(0)) {
						respond(res, 200, {
							kind: "binary",
							truncated: false,
							size: resolved.bytes.length
						});
						return;
					}
					const truncated = resolved.bytes.length > READ_CAP;
					const raw = truncated ? utf8SafeSlice(resolved.bytes.subarray(0, READ_CAP)).toString("utf8") : resolved.text;
					respond(res, 200, {
						kind: "text",
						content: raw.charCodeAt(0) === 65279 ? raw.slice(1) : raw,
						truncated,
						size: resolved.bytes.length
					});
					return;
				}
				if (action === "snapshot") {
					respond(res, 200, await captureSnapshot(String(body["cwd"] ?? ""), body["turn"]));
					return;
				}
				if (action === "undo") {
					const files = body["files"];
					if (!Array.isArray(files)) {
						respond(res, 200, {
							ok: false,
							error: "files must be an array",
							results: []
						});
						return;
					}
					const turn = body["turn"];
					const turnNo = typeof turn === "number" && Number.isInteger(turn) && turn >= 1 ? turn : void 0;
					const results = [];
					for (const file of files) results.push(await undoFile(String(body["cwd"] ?? ""), turnNo, {
						path: String(file.path ?? ""),
						diffs: Array.isArray(file.diffs) ? file.diffs.map((hunk) => ({
							oldText: hunk === null || typeof hunk !== "object" ? null : hunk.oldText ?? null,
							newText: hunk === null || typeof hunk !== "object" ? "" : String(hunk.newText ?? "")
						})) : []
					}));
					respond(res, 200, {
						ok: results.every((r) => r.ok),
						results
					});
					return;
				}
				if (action === "open-with") {
					await openWith(String(body["cwd"] ?? ""), String(body["path"] ?? ""), body["target"]);
					respond(res, 200, { ok: true });
					return;
				}
				respond(res, 404, {
					ok: false,
					error: "unknown action"
				});
			} catch (error) {
				respond(res, 200, {
					ok: false,
					error: String(error.message ?? error)
				});
			}
		}
	}), "dsh-diff-stat: fenced file api");
}
//#endregion
export { apply, inject, name };
