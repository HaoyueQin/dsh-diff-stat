window.__ModuleLoader__.load({
	id: "dsh-diff-stat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/glass.ts
		const GLASS_GLOBAL = "__DSH_BACKGROUND_GLASS__";
		const GLASS_EVENT = "dsh-background-glass:ready";
		function isGlassBridge(value) {
			if (value === null || typeof value !== "object") return false;
			const candidate = value;
			return candidate.version === 1 && candidate.bridgeId === "deepseek-harness-background" && typeof candidate.isActive === "function" && typeof candidate.register === "function";
		}
		function subscribeGlassReady(listener) {
			const existing = window[GLASS_GLOBAL];
			if (isGlassBridge(existing)) listener(existing);
			const onReady = (event) => {
				const detail = event.detail;
				if (!isGlassBridge(detail)) return;
				listener(detail);
			};
			window.addEventListener(GLASS_EVENT, onReady);
			return () => {
				window.removeEventListener(GLASS_EVENT, onReady);
			};
		}
		//#endregion
		//#region src/client/api.ts
		const BASE = "/dsh-diff-stat/api";
		const REQUEST_TIMEOUT_MS = 1e4;
		async function fetchWithTimeout(input, init) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
			try {
				return await fetch(input, {
					...init,
					signal: controller.signal
				});
			} finally {
				clearTimeout(timer);
			}
		}
		async function hostCall(action, body) {
			try {
				const res = await fetchWithTimeout(BASE + "/" + encodeURIComponent(action), {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				});
				if (!res.ok) return null;
				return await res.json();
			} catch {
				return null;
			}
		}
		let probe = null;
		function hostAvailable() {
			probe ??= (async () => {
				try {
					return (await fetchWithTimeout(BASE + "/ping")).ok;
				} catch {
					probe = null;
					return false;
				}
			})();
			return probe;
		}
		//#endregion
		//#region node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region node_modules/@deepseek-ai/dsh-util-workspace-path/lib/index.js
		function isWindowsStylePath(value) {
			return /^[A-Za-z]:[/\\]/.test(value) || value.startsWith("\\\\");
		}
		function abbreviateHomePath(path, home) {
			if (home === void 0 || home === "") return path;
			if (isWindowsStylePath(path) || isWindowsStylePath(home)) return path;
			const root = home.replace(/\/+$/, "");
			if (root === "" || root === "/") return path;
			if (path.replace(/\/+$/, "") === root) return "~";
			if (path.startsWith(`${root}/`)) return `~${path.slice(root.length)}`;
			return path;
		}
		//#endregion
		//#region \0dsh-css:src/client/tool-row.module.css.mjs
		const css$4 = ".tool-row-module_root{flex-direction:column;display:flex}.tool-row-module_row{position:relative;overflow:hidden}.tool-row-module_root[data-state=running] .tool-row-module_row:after{content:\"\";background:linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent) 55%, transparent 100%);pointer-events:none;width:300px;animation:2.6s ease-out infinite tool-row-module_dsh-tool-row-sweep;position:absolute;top:0;bottom:0;left:0}@keyframes tool-row-module_dsh-tool-row-sweep{0%{left:-300px}90%,to{left:100%}}.tool-row-module_leading{flex-shrink:0}.tool-row-module_root[data-tool^=cordis_] .tool-row-module_leading,.tool-row-module_root[data-tool^=cordis_] .tool-row-module_title{color:var(--dsw-alias-state-business-primary)}.tool-row-module_root[data-tool^=cordis_] .tool-row-module_title{font-weight:500}.tool-row-module_root[data-tool^=cordis_] .tool-row-module_sep{background:var(--dsw-alias-state-business-primary)}.tool-row-module_chevron{color:var(--dsw-alias-label-secondary)}.tool-row-module_title{font-weight:400}.tool-row-module_sep{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}.tool-row-module_summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);flex:auto;overflow:hidden}.tool-row-module_summarySuffix{white-space:nowrap;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);flex:none;margin-left:4px}.tool-row-module_diffStat{font-family:var(--ds-font-family-code);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 2px);color:var(--dsw-alias-label-caption);margin-left:10px;transform:translateY(.5px)}.tool-row-module_fileLink{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:inherit;text-align:left;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(24px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-secondary);text-decoration:underline dotted;text-decoration-color:var(--dsw-alias-label-tertiary);text-underline-offset:3px;cursor:pointer;background:0 0;border:none;flex:0 auto;margin:0;padding:0;text-decoration-thickness:1px;overflow:hidden}.tool-row-module_fileLink:hover{color:var(--dsw-alias-label-primary);text-decoration-color:currentColor}.tool-row-module_errorSummary{color:var(--dsw-alias-state-error-primary)}.tool-row-module_bodyWrap{flex-direction:column;display:flex}.tool-row-module_inspectButton{border:.5px solid var(--dsw-alias-border-l3);corner-shape:round;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}.tool-row-module_root:hover .tool-row-module_inspectButton,.tool-row-module_inspectButton:focus-visible{opacity:1}.tool-row-module_inspectButton:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}.tool-row-module_bodyScroll{max-height:260px;overflow-y:auto}.tool-row-module_ioCard{border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small);border-radius:12px;flex-direction:column;margin:4px 0 4px 4px;display:flex}.tool-row-module_ioSection{grid-template-columns:max-content 1fr;align-items:baseline;column-gap:14px;max-height:150px;padding:12px 16px;display:grid;overflow-y:auto}.tool-row-module_ioSection::-webkit-scrollbar-thumb{background-clip:padding-box;border:2px solid #0000;border-radius:6px}.tool-row-module_ioSection::-webkit-scrollbar-track{margin:6px 0}.tool-row-module_ioLabel{color:var(--dsw-alias-label-caption);align-self:start;position:sticky;top:0}.tool-row-module_ioDivider{background:var(--dsw-alias-border-l2);flex:none;height:.5px}.tool-row-module_ioText{white-space:pre-wrap;word-break:break-word;min-width:0;color:var(--dsw-alias-label-secondary)}.tool-row-module_ioText[data-error]{color:var(--dsw-alias-state-error-primary)}.tool-row-module_codeBody,.tool-row-module_terminalBody,.tool-row-module_diffBody,.tool-row-module_readBody,.tool-row-module_searchBody,.tool-row-module_webBody{margin:4px 0 4px 4px}.tool-row-module_searchRecovery{white-space:pre-wrap;overflow-wrap:anywhere;font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-tertiary);margin:4px 0 4px 4px}.tool-row-module_codeBody{--dsl-code-block-content-font:var(--dsw-font-markdown-code-block-small)}.tool-row-module_terminalBody{--dsl-terminal-font:var(--dsw-font-markdown-code-block-small);--dsl-terminal-line-height:18px;--dsl-terminal-output-max-height:224px;border:.5px solid var(--dsw-alias-border-l1)}.tool-row-module_visuallyHidden{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}";
		const tagId$4 = "dsh-diff-stat/tool-row.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-diff-stat";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var tool_row_module_css_default = {
			"bodyScroll": "tool-row-module_bodyScroll",
			"bodyWrap": "tool-row-module_bodyWrap",
			"chevron": "tool-row-module_chevron",
			"codeBody": "tool-row-module_codeBody",
			"diffBody": "tool-row-module_diffBody",
			"diffStat": "tool-row-module_diffStat",
			"dsh-tool-row-sweep": "tool-row-module_dsh-tool-row-sweep",
			"errorSummary": "tool-row-module_errorSummary",
			"fileLink": "tool-row-module_fileLink",
			"inspectButton": "tool-row-module_inspectButton",
			"ioCard": "tool-row-module_ioCard",
			"ioDivider": "tool-row-module_ioDivider",
			"ioLabel": "tool-row-module_ioLabel",
			"ioSection": "tool-row-module_ioSection",
			"ioText": "tool-row-module_ioText",
			"leading": "tool-row-module_leading",
			"readBody": "tool-row-module_readBody",
			"root": "tool-row-module_root",
			"row": "tool-row-module_row",
			"searchBody": "tool-row-module_searchBody",
			"searchRecovery": "tool-row-module_searchRecovery",
			"sep": "tool-row-module_sep",
			"summary": "tool-row-module_summary",
			"summarySuffix": "tool-row-module_summarySuffix",
			"terminalBody": "tool-row-module_terminalBody",
			"title": "tool-row-module_title",
			"visuallyHidden": "tool-row-module_visuallyHidden",
			"webBody": "tool-row-module_webBody"
		};
		//#endregion
		//#region \0dsh-css:src/client/badge.module.css.mjs
		const css$3 = ".badge-module_badge{font:var(--dsw-font-xs-13);font-variant-numeric:tabular-nums;flex:none;gap:6px;margin-left:4px;padding:0 2px;display:inline-flex}.badge-module_add{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 78%, var(--dsw-alias-label-primary))}.badge-module_del{color:var(--dsw-alias-state-error-primary)}";
		const tagId$3 = "dsh-diff-stat/badge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-diff-stat";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var badge_module_css_default = {
			"add": "badge-module_add",
			"badge": "badge-module_badge",
			"del": "badge-module_del"
		};
		const lcsCache = new Map();
		const LCS_CACHE_LIMIT = 64;
		function lcsOps(oldLines, newLines) {
			const m = oldLines.length;
			const n = newLines.length;
			const cacheKey = JSON.stringify([oldLines, newLines]);
			const cached = lcsCache.get(cacheKey);
			if (cached !== void 0) {
				lcsCache.delete(cacheKey);
				lcsCache.set(cacheKey, cached);
				return cached;
			}
			const compute = () => {
				if (m === 0) return newLines.map((text) => ({
					kind: "add",
					text
				}));
				if (n === 0) return oldLines.map((text) => ({
					kind: "del",
					text
				}));
				const w = n + 1;
				const dp = new Uint32Array((m + 1) * w);
				for (let i = m - 1; i >= 0; i--) {
					const row = i * w;
					const below = row + w;
					const line = oldLines[i];
					for (let j = n - 1; j >= 0; j--) dp[row + j] = line === newLines[j] ? dp[below + j + 1] + 1 : Math.max(dp[below + j], dp[row + j + 1]);
				}
				const ops = [];
				let i = 0;
				let j = 0;
				while (i < m && j < n) if (oldLines[i] === newLines[j]) {
					ops.push({
						kind: "ctx",
						text: oldLines[i]
					});
					i += 1;
					j += 1;
				} else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) {
					ops.push({
						kind: "del",
						text: oldLines[i]
					});
					i += 1;
				} else {
					ops.push({
						kind: "add",
						text: newLines[j]
					});
					j += 1;
				}
				while (i < m) {
					ops.push({
						kind: "del",
						text: oldLines[i]
					});
					i += 1;
				}
				while (j < n) {
					ops.push({
						kind: "add",
						text: newLines[j]
					});
					j += 1;
				}
				return ops;
			};
			const ops = compute();
			lcsCache.set(cacheKey, ops);
			if (lcsCache.size > LCS_CACHE_LIMIT) {
				const oldest = lcsCache.keys().next().value;
				if (oldest !== void 0) lcsCache.delete(oldest);
			}
			return ops;
		}
		function collapse(ops, context) {
			const keep = new Array(ops.length).fill(false);
			for (let k = 0; k < ops.length; k++) {
				if (ops[k].kind === "ctx") continue;
				for (let d = Math.max(0, k - context); d <= Math.min(ops.length - 1, k + context); d++) keep[d] = true;
			}
			const rows = [];
			let gapping = false;
			let i = 0;
			let j = 0;
			for (let k = 0; k < ops.length; k++) {
				const op = ops[k];
				const oldIdx = op.kind === "add" ? void 0 : i;
				const newIdx = op.kind === "del" ? void 0 : j;
				if (op.kind === "del") i += 1;
				else if (op.kind === "add") j += 1;
				else {
					i += 1;
					j += 1;
				}
				if (keep[k]) {
					const row = op.kind === "del" ? {
						kind: op.kind,
						text: op.text,
						oldIdx
					} : op.kind === "add" ? {
						kind: op.kind,
						text: op.text,
						newIdx
					} : {
						kind: op.kind,
						text: op.text,
						oldIdx,
						newIdx
					};
					rows.push(row);
					gapping = false;
				} else if (!gapping) {
					rows.push({
						kind: "gap",
						text: "⋯"
					});
					gapping = true;
				}
			}
			return rows;
		}
		function changedLineCounts(oldLines, newLines) {
			if (oldLines.length > 1200 || newLines.length > 1200) return null;
			let added = 0;
			let removed = 0;
			for (const op of lcsOps(oldLines, newLines)) if (op.kind === "del") removed++;
			else if (op.kind === "add") added++;
			return {
				added,
				removed
			};
		}
		function alignedHunkRows(oldLines, newLines) {
			if (oldLines.length > 1200 || newLines.length > 1200) return null;
			return collapse(lcsOps(oldLines, newLines), 3);
		}
		function terminatorOnly(oldText, newText, oldLines, newLines) {
			if (oldText === null || oldText === newText) return false;
			if (oldLines.length !== newLines.length) return false;
			if (oldLines.length > 1200 || newLines.length > 1200) return false;
			for (let i = 0; i < oldLines.length; i++) if (oldLines[i] !== newLines[i]) return false;
			return true;
		}
		function terminatorRows(oldLines, newLines) {
			const oldLast = oldLines[oldLines.length - 1] ?? "";
			const newLast = newLines[newLines.length - 1] ?? oldLast;
			return [{
				kind: "del",
				text: oldLast,
				oldIdx: oldLines.length - 1
			}, {
				kind: "add",
				text: newLast,
				newIdx: newLines.length - 1
			}];
		}
		function gutterNumbers(rows, base) {
			let seq = 1;
			return rows.map((row) => {
				if (row.kind === "gap") return void 0;
				const idx = row.kind === "del" ? row.oldIdx : row.newIdx;
				if (base !== null && idx !== void 0) return base + idx;
				return seq++;
			});
		}
		//#endregion
		//#region src/client/diff-contract.ts
		const argHunks = new WeakSet();
		function markArgHunks(diffs) {
			for (const hunk of diffs) argHunks.add(hunk);
		}
		function isArgHunk(hunk) {
			return argHunks.has(hunk);
		}
		function narrowDiffs(diffs) {
			if (!Array.isArray(diffs) || diffs.length === 0) return null;
			if (diffs.length > 1e3) return null;
			for (const hunk of diffs) {
				if (hunk === null || typeof hunk !== "object") return null;
				const { path, oldText, newText } = hunk;
				if (typeof path !== "string" || path === "" || oldText !== null && typeof oldText !== "string" || typeof newText !== "string") return null;
				if (typeof oldText === "string" && oldText.length > 524288) return null;
				if (newText.length > 524288) return null;
			}
			return diffs;
		}
		function parseArgs(argsRaw) {
			try {
				const parsed = JSON.parse(argsRaw);
				if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return void 0;
				return parsed;
			} catch {
				return;
			}
		}
		function stringArg(args, key) {
			const value = args[key];
			return typeof value === "string" ? value : void 0;
		}
		function contentLines(text) {
			if (text === "") return [];
			return (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
		}
		function appliedHunks(meta) {
			return narrowDiffs(metaDiffs(meta));
		}
		function diffStats(diffs) {
			let added = 0;
			let removed = 0;
			for (const hunk of diffs) {
				const newLines = contentLines(hunk.newText);
				const oldLines = hunk.oldText === null ? [] : contentLines(hunk.oldText);
				const counted = hunk.oldText === null && hunk.newText === "" ? {
					added: 1,
					removed: 0
				} : terminatorOnly(hunk.oldText, hunk.newText, oldLines, newLines) ? {
					added: 1,
					removed: 1
				} : changedLineCounts(oldLines, newLines);
				if (counted === null) {
					added += newLines.length;
					removed += oldLines.length;
				} else {
					added += counted.added;
					removed += counted.removed;
				}
			}
			return {
				added,
				removed
			};
		}
		function isMutationToolName(name) {
			return name === "edit" || name === "write" || name === "str_replace_editor";
		}
		function callTimeDiffs(toolName, argsRaw) {
			const args = parseArgs(argsRaw);
			if (args === void 0) return null;
			if (toolName === "write") {
				const path = stringArg(args, "file_path") ?? stringArg(args, "path");
				const content = stringArg(args, "content");
				if (path === void 0 || path === "" || content === void 0) return null;
				return [{
					path,
					oldText: null,
					newText: content
				}];
			}
			if (toolName === "edit") {
				const path = stringArg(args, "file_path") ?? stringArg(args, "path");
				const oldString = stringArg(args, "old_string");
				const newString = stringArg(args, "new_string");
				if (path === void 0 || path === "" || oldString === void 0 || newString === void 0) return null;
				return [{
					path,
					oldText: oldString || null,
					newText: newString
				}];
			}
			if (toolName === "str_replace_editor") {
				const path = stringArg(args, "path");
				if (path === void 0) return null;
				const command = stringArg(args, "command");
				if (command === "create") {
					const fileText = stringArg(args, "file_text");
					if (fileText === void 0) return null;
					return [{
						path,
						oldText: null,
						newText: fileText
					}];
				}
				if (command === "str_replace") {
					const oldString = stringArg(args, "old_str");
					const newString = stringArg(args, "new_str");
					if (oldString === void 0 || newString === void 0) return null;
					return [{
						path,
						oldText: oldString || null,
						newText: newString
					}];
				}
				if (command === "insert") {
					const newString = stringArg(args, "new_str");
					if (newString === void 0) return null;
					return [{
						path,
						oldText: null,
						newText: newString
					}];
				}
			}
			return null;
		}
		function callToolName(block) {
			return "kind" in block ? block.call?.name ?? "" : block.name;
		}
		function metaDiffs(meta) {
			if (meta === null || typeof meta !== "object") return null;
			const diffs = meta["diffs"];
			return diffs === void 0 ? null : diffs;
		}
		function diffCardModel(block) {
			const toolName = callToolName(block);
			if (!("kind" in block)) {
				const fallback = callTimeDiffs(toolName, block.argsRaw);
				if (fallback !== null) markArgHunks(fallback);
				return fallback === null ? null : { card: { diffs: fallback } };
			}
			const applied = narrowDiffs(metaDiffs(block.meta));
			if (applied !== null) return { card: { diffs: applied } };
			if (block.isError) return null;
			const fallback = callTimeDiffs(toolName, block.call?.argsRaw ?? "");
			if (fallback !== null) markArgHunks(fallback);
			return fallback === null ? null : { card: { diffs: fallback } };
		}
		function mutationHunks(toolName, argsRaw, meta) {
			const applied = narrowDiffs(metaDiffs(meta));
			if (applied !== null) return applied;
			const args = callTimeDiffs(toolName, argsRaw);
			if (args !== null) markArgHunks(args);
			return args;
		}
		//#endregion
		//#region src/client/turn-merge.ts
		const EMPTY_CHANGED_FILES = [];
		function pathKey(path) {
			if (typeof path !== "string") return "";
			return path.replace(/[\\/]/g, "/").replace(/\/\/+/g, "/").replace(/^\.\//, "");
		}
		function changesForClosing(data, seq = Number.POSITIVE_INFINITY) {
			if (data === void 0) return [];
			const files = [];
			const byPath = new Map();
			if (!Array.isArray(data.changed)) return [];
			for (const entry of data.changed) {
				if (entry === null || typeof entry !== "object") continue;
				if (typeof entry.seq !== "number" || entry.seq > seq) continue;
				if (typeof entry.path !== "string" || entry.path === "" || !Array.isArray(entry.diffs)) continue;
				const key = pathKey(entry.path);
				const existing = byPath.get(key);
				if (existing === void 0) {
					const diffs = [...entry.diffs];
					byPath.set(key, diffs);
					files.push({
						path: entry.path,
						diffs
					});
				} else existing.push(...entry.diffs);
			}
			return files;
		}
		function claimFor(data, seq) {
			const files = changesForClosing(data, seq);
			if (files.length > 0) return files;
			return data?.hasCodeDispatch === true ? EMPTY_CHANGED_FILES : null;
		}
		function collectDispatchFiles(root, into) {
			const seen = new Set();
			const byKey = new Map();
			const order = [];
			const visit = (block) => {
				for (const sub of block.subCalls) {
					if (seen.has(sub.callId)) continue;
					seen.add(sub.callId);
					if ("kind" in sub) {
						const name = sub.call?.name ?? "";
						if (!sub.isError && isMutationToolName(name)) {
							const hunks = callTimeDiffs(name, sub.call?.argsRaw ?? "");
							if (hunks !== null) {
								markArgHunks(hunks);
								for (const hunk of hunks) {
									const key = pathKey(hunk.path);
									const existing = byKey.get(key);
									if (existing === void 0) {
										byKey.set(key, [hunk]);
										order.push(hunk.path);
									} else existing.push(hunk);
								}
							}
						}
					}
					visit(sub);
				}
			};
			visit(root);
			for (const path of order) into.push({
				path,
				diffs: byKey.get(pathKey(path)) ?? []
			});
			return into;
		}
		function mergeChangedFiles(native, dispatch) {
			if (dispatch.length === 0) return native;
			const out = [];
			const byKey = new Map();
			for (const file of native) {
				const key = pathKey(file.path);
				const cloned = [...file.diffs];
				byKey.set(key, cloned);
				out.push({
					path: file.path,
					diffs: cloned
				});
			}
			for (const file of dispatch) {
				const key = pathKey(file.path);
				const existing = byKey.get(key);
				if (existing === void 0) {
					byKey.set(key, [...file.diffs]);
					out.push({
						path: file.path,
						diffs: [...file.diffs]
					});
				} else existing.push(...file.diffs);
			}
			return out;
		}
		//#endregion
		//#region \0dsh-css:src/client/diff-window.module.css.mjs
		const css$2 = ".diff-window-module_window{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f33);background:var(--dsw-alias-markdown-code-block);border-radius:6px;overflow:hidden}.diff-window-module_scroll{white-space:pre;font:var(--dsw-font-markdown-code-block,var(--dsw-font-xs-13));min-height:0;padding:4px 0;overflow:auto}.diff-window-module_line{box-sizing:border-box;width:max-content;min-width:100%;min-height:var(--dsl-diff-line-height,18px);color:var(--dsw-alias-label-primary);padding:0 8px 0 0;display:flex}.diff-window-module_no{text-align:right;font-variant-numeric:tabular-nums;min-width:4ch;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-markdown-code-block);border-right:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);user-select:none;flex:none;margin-right:8px;padding:0 6px 0 10px;position:sticky;left:0}.diff-window-module_tx{flex:auto;min-width:0}.diff-window-module_del .diff-window-module_no{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, var(--dsw-alias-markdown-code-block));box-shadow:inset 3px 0 0 0 var(--dsw-alias-state-error-primary)}.diff-window-module_add .diff-window-module_no{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 7%, var(--dsw-alias-markdown-code-block));box-shadow:inset 3px 0 0 0 var(--dsw-alias-state-success-primary)}.diff-window-module_pathBar{box-sizing:border-box;width:max-content;min-width:100%;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-markdown-code-block);border-bottom:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);z-index:1;padding:3px 8px;font-weight:600;position:sticky;top:0}.diff-window-module_pathText{display:inline-block;position:sticky;left:8px}.diff-window-module_ctx{color:var(--dsw-alias-label-secondary)}.diff-window-module_gap{color:var(--dsw-alias-label-tertiary)}.diff-window-module_add{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 78%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 7%, transparent)}.diff-window-module_del{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent)}body[data-dsh-bg-glass] [data-diff-window] .diff-window-module_add{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 13%, transparent)}body[data-dsh-bg-glass] [data-diff-window] .diff-window-module_del{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 13%, transparent)}body[data-dsh-bg-glass] [data-diff-window] .diff-window-module_del .diff-window-module_no{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 13%, var(--dsw-alias-markdown-code-block))}body[data-dsh-bg-glass] [data-diff-window] .diff-window-module_add .diff-window-module_no{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 13%, var(--dsw-alias-markdown-code-block))}.diff-window-module_footer{border-top:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);color:var(--dsw-alias-label-tertiary);padding:3px 8px}";
		const tagId$2 = "dsh-diff-stat/diff-window.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-diff-stat";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var diff_window_module_css_default = {
			"add": "diff-window-module_add",
			"ctx": "diff-window-module_ctx",
			"del": "diff-window-module_del",
			"footer": "diff-window-module_footer",
			"gap": "diff-window-module_gap",
			"line": "diff-window-module_line",
			"no": "diff-window-module_no",
			"pathBar": "diff-window-module_pathBar",
			"pathText": "diff-window-module_pathText",
			"scroll": "diff-window-module_scroll",
			"tx": "diff-window-module_tx",
			"window": "diff-window-module_window"
		};
		//#endregion
		//#region src/client/diff-window.tsx
		function buildRows(diffs, bases) {
			const rows = [];
			const paths = new Set();
			let added = 0;
			let removed = 0;
			let prevKey;
			for (let hunkIndex = 0; hunkIndex < diffs.length; hunkIndex++) {
				const diff = diffs[hunkIndex];
				const key = pathKey(diff.path);
				paths.add(key);
				if (key !== prevKey) rows.push({
					kind: "path",
					text: diff.path
				});
				else if (rows[rows.length - 1]?.kind !== "gap") rows.push({
					kind: "gap",
					text: "⋯"
				});
				prevKey = key;
				const base = bases?.[hunkIndex] ?? null;
				let body;
				if (diff.oldText === null && diff.newText === "") body = [{
					kind: "add",
					text: "",
					newIdx: 0
				}];
				else {
					const newLines = contentLines(diff.newText);
					const oldLines = diff.oldText === null ? [] : contentLines(diff.oldText);
					let aligned = alignedHunkRows(oldLines, newLines);
					if (aligned !== null && terminatorOnly(diff.oldText, diff.newText, oldLines, newLines)) aligned = terminatorRows(oldLines, newLines);
					body = aligned ?? [...oldLines.map((text, oldIdx) => ({
						kind: "del",
						text,
						oldIdx
					})), ...newLines.map((text, newIdx) => ({
						kind: "add",
						text,
						newIdx
					}))];
				}
				const nos = gutterNumbers(body, base);
				for (let r = 0; r < body.length; r++) {
					const row = body[r];
					rows.push({
						kind: row.kind,
						text: row.text,
						no: nos[r]
					});
					if (row.kind === "del") removed++;
					else if (row.kind === "add") added++;
				}
			}
			return {
				rows,
				added,
				removed,
				files: paths.size
			};
		}
		const ROW_CLASS = {
			del: diff_window_module_css_default.del,
			add: diff_window_module_css_default.add,
			ctx: diff_window_module_css_default.ctx,
			gap: diff_window_module_css_default.gap
		};
		function DiffWindow({ diffs, bases, maxHeight = 320 }) {
			const { rows, added, removed, files } = (0, react.useMemo)(() => buildRows(diffs, bases), [diffs, bases]);
			if (rows.length === 0) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: diff_window_module_css_default.window,
				"data-diff-window": "",
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: diff_window_module_css_default.scroll,
					style: { maxHeight },
					children: rows.map((row, index) => row.kind === "path" ? (0, react_jsx_runtime.jsx)("div", {
						className: diff_window_module_css_default.pathBar,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: diff_window_module_css_default.pathText,
							children: row.text
						})
					}, index) : (0, react_jsx_runtime.jsxs)("div", {
						className: diff_window_module_css_default.line + " " + ROW_CLASS[row.kind],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: diff_window_module_css_default.no,
							"aria-hidden": true,
							children: row.no ?? ""
						}), (0, react_jsx_runtime.jsx)("span", {
							className: diff_window_module_css_default.tx,
							children: row.text
						})]
					}, index))
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: diff_window_module_css_default.footer,
					children: [
						"└ +",
						added,
						" −",
						removed,
						" · ",
						files,
						" file",
						files === 1 ? "" : "s"
					]
				})]
			});
		}
		const CACHE_CAP = 16;
		const CACHE_TTL_MS = 3e4;
		const cache = new Map();
		function cacheKey(path, cwd) {
			const norm = path.replace(/[\\/]/g, "/").replace(/\/\/+/g, "/").replace(/^\.\//, "");
			return (cwd ?? "") + "\0" + norm;
		}
		function invalidateBoostCache(path, cwd) {
			cache.delete(cacheKey(path, cwd));
		}
		async function readCached(path, cwd) {
			const key = cacheKey(path, cwd);
			const now = Date.now();
			const hit = cache.get(key);
			if (hit !== void 0) {
				if (now - hit.at > CACHE_TTL_MS) cache.delete(key);
				else {
					cache.delete(key);
					cache.set(key, hit);
					return hit.text;
				}
			}
			const result = await hostCall("files.read", {
				cwd,
				path
			});
			if (result === null || result.kind !== "text" || typeof result.content !== "string") return null;
			if (result.content.length > 1048576) return null;
			cache.set(key, {
				text: result.content,
				at: now
			});
			if (cache.size > CACHE_CAP) {
				const oldest = cache.keys().next().value;
				if (oldest !== void 0) cache.delete(oldest);
			}
			return result.content;
		}
		function locateOnce(needle, fileLines) {
			if (needle.length === 0) return null;
			let at = -1;
			for (let i = 0; i + needle.length <= fileLines.length; i++) {
				let matches = true;
				for (let j = 0; j < needle.length; j++) if (fileLines[i + j] !== needle[j]) {
					matches = false;
					break;
				}
				if (!matches) continue;
				if (at !== -1) return null;
				at = i;
			}
			return at === -1 ? null : at;
		}
		function wrapWithContext(hunk, fileLines, at) {
			const newLines = contentLines(hunk.newText);
			const before = fileLines.slice(Math.max(0, at - 3), at);
			const afterStart = at + newLines.length;
			const after = fileLines.slice(afterStart, Math.min(fileLines.length, afterStart + 3));
			if (before.length === 0 && after.length === 0) return null;
			const oldLines = hunk.oldText === null ? [] : contentLines(hunk.oldText);
			return {
				path: hunk.path,
				oldText: [
					...before,
					...oldLines,
					...after
				].join("\n"),
				newText: [
					...before,
					...newLines,
					...after
				].join("\n")
			};
		}
		async function prepareDiffWindow(diffs, path, cwd) {
			const content = await readCached(path, cwd);
			if (content === null) return null;
			const fileLines = contentLines(content);
			let changed = false;
			const bases = diffs.map(() => null);
			const out = diffs.map((hunk, k) => {
				if (!isArgHunk(hunk) && hunk.oldText === null) {
					bases[k] = 1;
					return hunk;
				}
				if (contentLines(hunk.newText).length > 1200 || contentLines(hunk.oldText ?? "").length > 1200) return hunk;
				const newLines = contentLines(hunk.newText);
				if (newLines.length > 0) {
					const at = locateOnce(newLines, fileLines);
					if (at === null) return hunk;
					if (isArgHunk(hunk)) {
						const boosted = wrapWithContext(hunk, fileLines, at);
						if (boosted !== null) {
							bases[k] = at - Math.min(at, 3) + 1;
							changed = true;
							return boosted;
						}
					}
					bases[k] = at + 1;
					return hunk;
				}
				const oldLines = contentLines(hunk.oldText ?? "");
				const at = locateOnce(oldLines.slice(0, Math.min(3, oldLines.length)), fileLines);
				if (at !== null) bases[k] = at + 1;
				return hunk;
			});
			return {
				diffs: changed ? out : diffs,
				bases
			};
		}
		//#endregion
		//#region src/client/mutation-row.tsx
		function resultText(node) {
			const parts = [];
			for (const block of node.content) if (block.type === "text") parts.push(block.text);
			else parts.push(JSON.stringify(block, null, 2));
			if (parts.length === 0 && node.error !== void 0) parts.push(node.error.name + ": " + node.error.code);
			return parts.join("\n");
		}
		function firstLine(text) {
			const nl = text.indexOf("\n");
			return nl === -1 ? text : text.slice(0, nl);
		}
		function rowModel(toolName, block, cwd, home) {
			const variant = toolName === "write" ? "write" : "edit";
			const done = "kind" in block;
			const argsRaw = (done ? block.call?.argsRaw : block.argsRaw) ?? "";
			const state = !done ? "running" : block.error?.code === "interrupted" ? "stopped" : block.isError ? "error" : "ok";
			const parsed = parseArgs(argsRaw);
			const filePath = parsed !== void 0 && typeof parsed["file_path"] === "string" ? parsed["file_path"] : void 0;
			const altPath = parsed !== void 0 && typeof parsed["path"] === "string" ? parsed["path"] : void 0;
			const path = filePath !== void 0 && filePath !== "" ? filePath : altPath !== void 0 && altPath !== "" ? altPath : void 0;
			const rel = (text) => {
				if (cwd === void 0 || cwd === "") return text;
				const root = cwd.replace(/[/\\]+$/, "");
				if (text.startsWith(root + "/") || text.startsWith(root + "\\")) return text.slice(root.length + 1);
				return text;
			};
			const summary = path !== void 0 ? abbreviateHomePath(rel(path), home) : firstLine(argsRaw === "" ? block.callId : argsRaw);
			const output = done ? resultText(block) || null : null;
			return {
				variant,
				title: variant === "write" ? "Write" : toolName === "str_replace_editor" ? "StrReplace" : "Edit",
				summary,
				filePath: path,
				body: argsRaw === "" ? null : parsed !== void 0 ? JSON.stringify(parsed, null, 2) : argsRaw,
				output,
				errorSummary: state === "error" && output !== null ? firstLine(output) : null,
				state
			};
		}
		function leadingFor(state, icon) {
			switch (state) {
				case "error": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" });
				case "stopped": return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "warning" });
				default: return icon;
			}
		}
		function stateStatus(state) {
			switch (state) {
				case "running": return "Running";
				case "error": return "Failed";
				case "stopped": return "Stopped";
				default: return null;
			}
		}
		function MutationRow({ toolName, block, cwd, home, openFile, inspect }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const model = (0, react.useMemo)(() => rowModel(toolName, block, cwd, home), [
				toolName,
				block,
				cwd,
				home
			]);
			const diffBody = (0, react.useMemo)(() => diffCardModel(block), [block]) ?? null;
			const stats = (0, react.useMemo)(() => diffBody !== null && model.state !== "error" && model.state !== "stopped" ? diffStats(diffBody.card.diffs) : null, [diffBody, model.state]);
			const outputText = model.output;
			const expandable = model.body !== null || outputText !== null || diffBody !== null;
			const open = expanded && expandable;
			const [prepared, setPrepared] = (0, react.useState)(null);
			const rawDiffs = diffBody?.card.diffs ?? null;
			const preparable = open === true && model.state === "ok" && rawDiffs !== null;
			(0, react.useEffect)(() => {
				if (!preparable || rawDiffs === null) {
					setPrepared(null);
					return;
				}
				const path = rawDiffs[0]?.path;
				if (path === void 0) return;
				let alive = true;
				prepareDiffWindow(rawDiffs, path, cwd).then((next) => {
					if (alive) setPrepared(next);
				});
				return () => {
					alive = false;
				};
			}, [
				preparable,
				rawDiffs,
				cwd
			]);
			const renderDiffs = prepared?.diffs ?? rawDiffs;
			const renderBases = prepared?.bases;
			const status = stateStatus(model.state);
			const failureLine = model.state === "error" ? model.errorSummary ?? null : null;
			const summaryText = failureLine ?? model.summary;
			const fileLink = model.filePath !== void 0 && failureLine === null;
			const toggleExpand = () => {
				setExpanded((v) => !v);
			};
			const openFilePath = (event) => {
				event.stopPropagation();
				if (model.filePath !== void 0) openFile(model.filePath);
			};
			const fileLinkKeyDown = (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.stopPropagation();
					event.preventDefault();
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: tool_row_module_css_default.root,
				"data-variant": model.variant,
				"data-tool": toolName,
				"data-state": model.state,
				"data-diff-stat-row": "",
				children: [status !== null && (0, react_jsx_runtime.jsx)("span", {
					className: tool_row_module_css_default.visuallyHidden,
					children: status
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					rowClassName: tool_row_module_css_default.row,
					leadingClassName: tool_row_module_css_default.leading,
					titleClassName: tool_row_module_css_default.title,
					chevronClassName: tool_row_module_css_default.chevron,
					icon: leadingFor(model.state, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutline16, { size: 14 })),
					title: model.title,
					open,
					expandable,
					expandOnRowClick: true,
					keepContentWhenOpen: true,
					onToggle: toggleExpand,
					collapsedContent: (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: (summaryText !== "" || stats !== null) && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: tool_row_module_css_default.sep,
							"aria-hidden": true
						}),
						fileLink ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: tool_row_module_css_default.fileLink,
							title: summaryText,
							onClick: openFilePath,
							onKeyDown: fileLinkKeyDown,
							children: summaryText
						}) : (0, react_jsx_runtime.jsx)("span", {
							className: clsx(tool_row_module_css_default.summary, failureLine !== null && tool_row_module_css_default.errorSummary),
							children: summaryText
						}),
						stats !== null && (0, react_jsx_runtime.jsxs)("span", {
							className: badge_module_css_default.badge,
							"data-diffstat": "",
							"aria-label": stats.added + " added, " + stats.removed + " removed lines",
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: badge_module_css_default.add,
								children: ["+", stats.added]
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: badge_module_css_default.del,
								children: ["−", stats.removed]
							})]
						})
					] }) }),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: tool_row_module_css_default.bodyWrap,
						children: [renderDiffs !== null ? (0, react_jsx_runtime.jsx)(DiffWindow, {
							diffs: renderDiffs,
							bases: renderBases,
							maxHeight: 480
						}) : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: (model.body !== null || outputText !== null) && (0, react_jsx_runtime.jsxs)("div", {
							className: tool_row_module_css_default.ioCard,
							"data-diff-stat-io": "",
							children: [
								model.body !== null && (0, react_jsx_runtime.jsxs)("div", {
									className: tool_row_module_css_default.ioSection,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: tool_row_module_css_default.ioLabel,
										children: "IN"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: tool_row_module_css_default.ioText,
										children: model.body
									})]
								}),
								model.body !== null && outputText !== null && (0, react_jsx_runtime.jsx)("span", {
									className: tool_row_module_css_default.ioDivider,
									"aria-hidden": true
								}),
								outputText !== null && (0, react_jsx_runtime.jsxs)("div", {
									className: tool_row_module_css_default.ioSection,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: tool_row_module_css_default.ioLabel,
										children: "OUT"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: tool_row_module_css_default.ioText,
										"data-error": model.state === "error" || void 0,
										children: outputText
									})]
								})
							]
						}) }), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: tool_row_module_css_default.inspectButton,
							onClick: inspect,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutline12, {}), "Inspect"]
						})]
					})
				})]
			});
		}
		//#endregion
		//#region node_modules/@deepseek-ai/dsh-session/lib/types/surface.js
		const SURFACE_EVENT_TYPES = new Set([
			"system/message",
			"user/message",
			"assistant/message",
			"tool/result"
		]);
		function isSurfaceEvent(event) {
			if (!SURFACE_EVENT_TYPES.has(event.type)) return false;
			return event.surfaceOp !== void 0;
		}
		function isAppendSurfaceEvent(event) {
			return isSurfaceEvent(event) && event.surfaceOp === "append";
		}
		//#endregion
		//#region src/client/turn-changes.ts
		function settledHunks(call, meta) {
			if (call === void 0) return appliedHunks(meta);
			return mutationHunks(call.name, call.argsRaw, meta);
		}
		function basename(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? path : path.slice(at + 1);
		}
		function dispatchData(event) {
			if (event.type !== "tool/code-dispatch" && event.type !== "tool/ptc-dispatch" && event.type !== "tool/code-dispatch-start" && event.type !== "tool/ptc-dispatch-start") return null;
			return event.data ?? {};
		}
		const selectMemo = new WeakMap();
		const rootCallTurn = new Map();
		const ROOT_CALL_TURN_LIMIT = 8192;
		function selectChangedFiles(owner) {
			const data = owner.turn.data.get("diff-stat");
			if (data === void 0) return null;
			let bySeq = selectMemo.get(data);
			if (bySeq === void 0) {
				bySeq = new Map();
				selectMemo.set(data, bySeq);
			}
			const cached = bySeq.get(owner.seq);
			if (cached !== void 0) return cached;
			const result = claimFor(data, owner.seq);
			bySeq.set(owner.seq, result);
			return result;
		}
		function startState(match) {
			if (match.event.type !== "turn/start") throw new Error("diff-stat changes start requires turn/start");
			const turn = match.event.data?.turn;
			if (typeof turn !== "number" || !Number.isInteger(turn)) throw new Error("diff-stat changes start requires numeric turn");
			return {
				turn,
				calls: new Map(),
				settled: new Set(),
				changed: [],
				hasCodeDispatch: false
			};
		}
		function applyUpdateState(state, match) {
			if (match.event.type === "tool/call") {
				const data = match.event.data ?? {};
				if (typeof data["callId"] !== "string" || data["callId"] === "") return state;
				const calls = new Map(state.calls);
				calls.set(data["callId"], {
					name: String(data["name"] ?? ""),
					argsRaw: String(data["arguments"] ?? "")
				});
				return {
					...state,
					calls,
					hasCodeDispatch: state.hasCodeDispatch || match.event.data.name === "run_code"
				};
			}
			if (match.event.type === "tool/result") {
				const data = match.event.data ?? {};
				const message = data["message"] ?? {};
				const content = message["content"];
				const first = Array.isArray(content) ? content[0] : void 0;
				if (first === void 0 || first === null) return state;
				if (first["isError"] === true) return state;
				const callId = (message["source"] ?? {})["callId"];
				if (typeof callId !== "string" || callId === "") return state;
				if (state.settled.has(callId)) return state;
				const hunks = settledHunks(state.calls.get(callId), data["meta"]);
				if (hunks === null || hunks.length === 0) return state;
				const path = hunks[0]?.path;
				if (typeof path !== "string" || path === "") return state;
				const settled = new Set(state.settled);
				settled.add(callId);
				return {
					...state,
					settled,
					changed: [...state.changed, {
						seq: match.event.seq,
						path,
						diffs: hunks
					}]
				};
			}
			if (dispatchData(match.event) !== null) return {
				...state,
				hasCodeDispatch: true
			};
			return state;
		}
		function matchTurn(match) {
			const location = match.location;
			return location.kind === "step" || location.kind === "turn" ? location.turn?.turn : void 0;
		}
		function foldMatches(matches, contextTurn) {
			let state;
			for (const match of matches) {
				if (match.role === "start") {
					state = startState(match);
					continue;
				}
				if (state === void 0) {
					const turn = matchTurn(match) ?? contextTurn;
					if (turn === void 0) continue;
					state = {
						turn,
						calls: new Map(),
						settled: new Set(),
						changed: [],
						hasCodeDispatch: false
					};
				}
				state = applyUpdateState(state, match);
			}
			return state;
		}
		const turnChangesDefinition = {
			kind: "diff-stat",
			match: (event) => {
				const data = event.data ?? {};
				if (event.type === "turn/start") return typeof data["turn"] === "number" ? {
					id: String(data["turn"]),
					role: "start"
				} : null;
				if (event.type === "tool/call") {
					const learnedTurn = data["turn"];
					const callId = data["callId"];
					if (typeof learnedTurn === "number" && typeof callId === "string" && callId !== "") {
						if (!rootCallTurn.has(callId) && rootCallTurn.size >= ROOT_CALL_TURN_LIMIT) {
							const oldest = rootCallTurn.keys().next().value;
							if (oldest !== void 0) rootCallTurn.delete(oldest);
						}
						rootCallTurn.set(String(callId), learnedTurn);
					}
					return typeof data["turn"] === "number" ? {
						id: String(data["turn"]),
						role: "update"
					} : null;
				}
				if (event.type === "tool/result" && isAppendSurfaceEvent(event)) return typeof data["turn"] === "number" ? {
					id: String(data["turn"]),
					role: "update"
				} : null;
				const dispatch = dispatchData(event);
				if (dispatch !== null) {
					const learned = typeof dispatch["rootCallId"] === "string" ? rootCallTurn.get(dispatch["rootCallId"]) : void 0;
					return typeof learned === "number" ? {
						id: String(learned),
						role: "update"
					} : null;
				}
				return null;
			},
			start: (_context, match) => startState(match),
			update: (context, match) => applyUpdateState(context.state, match),
			buildLocationData: (context, scope) => {
				if (scope !== "turn") return null;
				const contextTurn = Number(context.id);
				const state = foldMatches(context.matches, Number.isInteger(contextTurn) && contextTurn >= 1 ? contextTurn : void 0);
				return state === void 0 ? null : {
					kind: "turn",
					turn: state.turn,
					key: "diff-stat",
					value: {
						changed: state.changed,
						hasCodeDispatch: state.hasCodeDispatch
					}
				};
			}
		};
		//#endregion
		//#region src/client/turn-join.ts
		function extractDispatchFiles(locations, nodesStore, turn, cache) {
			const keys = locations.getTurn(turn);
			if (cache !== null && cache.turn === turn && cache.keys.length === keys.length) {
				let same = true;
				for (let i = 0; i < keys.length; i++) if (cache.keys[i] !== keys[i] || cache.nodes[i] !== nodesStore.get(keys[i])) {
					same = false;
					break;
				}
				if (same) return {
					files: cache.result,
					next: cache
				};
			}
			const nodes = [];
			const files = [];
			for (const key of keys) {
				const node = nodesStore.get(key);
				nodes.push(node);
				if (node === void 0 || node.kind !== "tool-call") continue;
				const root = node.data?.root;
				if (root !== void 0) collectDispatchFiles(root, files);
			}
			return {
				files,
				next: {
					turn,
					keys,
					nodes,
					result: files
				}
			};
		}
		//#endregion
		//#region src/client/icons.tsx
		function EyeIcon({ size = 13 }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("path", { d: "M1.5 8s2.4-4.2 6.5-4.2S14.5 8 14.5 8s-2.4 4.2-6.5 4.2S1.5 8 1.5 8Z" }), (0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "2.1"
				})]
			});
		}
		function ExternalLinkIcon({ size = 13 }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.3",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("path", { d: "M6.5 3.5H3.8a1.3 1.3 0 0 0-1.3 1.3v7.4a1.3 1.3 0 0 0 1.3 1.3h7.4a1.3 1.3 0 0 0 1.3-1.3V9.5" }), (0, react_jsx_runtime.jsx)("path", { d: "M9.5 2.5h4v4M13.2 2.8 7.8 8.2" })]
			});
		}
		function VSCodeIcon({ size = 13 }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "currentColor",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M11.5 1.2 6.6 5.8 3.6 3.5 2 4.3l2.8 3.7L2 11.7l1.6.8 3-2.3 4.9 4.6 2.5-1.2V2.4l-2.5-1.2Zm.2 3.2v7.2L8.2 8l3.5-3.6Z" })
			});
		}
		function CloseIcon({ size = 12 }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "m3.5 3.5 9 9m0-9-9 9" })
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/file-peek.module.css.mjs
		const css$1 = ".file-peek-module_peek{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f33);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block,var(--dsw-font-xs-13));border-radius:6px;overflow:hidden}.file-peek-module_bar{color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);align-items:center;gap:8px;padding:3px 8px;display:flex}.file-peek-module_barText{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.file-peek-module_close{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex:none;align-items:center;margin-left:auto;padding:1px 4px;display:inline-flex}.file-peek-module_close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}.file-peek-module_note{color:var(--dsw-alias-label-secondary);padding:6px 8px}.file-peek-module_body{white-space:pre;max-height:320px;padding:4px 0;overflow:auto}.file-peek-module_line{box-sizing:border-box;min-height:var(--dsl-diff-line-height,18px);color:var(--dsw-alias-label-primary);padding:0 8px 0 0;display:flex}.file-peek-module_no{text-align:right;font-variant-numeric:tabular-nums;min-width:4ch;color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-markdown-code-block);border-right:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);user-select:none;flex:none;margin-right:8px;padding:0 6px 0 10px;position:sticky;left:0}.file-peek-module_tx{flex:auto;min-width:0}.file-peek-module_detail{opacity:.75}";
		const tagId$1 = "dsh-diff-stat/file-peek.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-diff-stat";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var file_peek_module_css_default = {
			"bar": "file-peek-module_bar",
			"barText": "file-peek-module_barText",
			"body": "file-peek-module_body",
			"close": "file-peek-module_close",
			"detail": "file-peek-module_detail",
			"line": "file-peek-module_line",
			"no": "file-peek-module_no",
			"note": "file-peek-module_note",
			"peek": "file-peek-module_peek",
			"tx": "file-peek-module_tx"
		};
		//#endregion
		//#region src/client/file-peek.tsx
		function FilePeek({ path, cwd, onClose, t }) {
			const [state, setState] = (0, react.useState)({ kind: "loading" });
			const closeLabel = t("peek.close");
			(0, react.useEffect)(() => {
				let alive = true;
				setState({ kind: "loading" });
				(async () => {
					const result = await hostCall("files.read", {
						cwd,
						path
					});
					if (!alive) return;
					if (result === null) setState({
						kind: "error",
						key: "hostUnavailable"
					});
					else if (result.kind === "binary") {
						const size = typeof result.size === "number" && Number.isFinite(result.size) ? result.size : 0;
						setState({
							kind: "binary",
							size
						});
					} else if (typeof result.content !== "string") setState({
						kind: "error",
						key: "readFailed",
						detail: result.error
					});
					else {
						const size = typeof result.size === "number" && Number.isFinite(result.size) ? result.size : result.content.length;
						setState({
							kind: "text",
							content: result.content,
							truncated: result.truncated === true,
							size
						});
					}
				})();
				return () => {
					alive = false;
				};
			}, [path, cwd]);
			if (state.kind === "loading") return (0, react_jsx_runtime.jsxs)("div", {
				className: file_peek_module_css_default.peek,
				"data-diff-stat-peek": "",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: file_peek_module_css_default.bar,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: file_peek_module_css_default.barText,
						children: path
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: file_peek_module_css_default.close,
						"aria-label": closeLabel,
						onClick: onClose,
						children: (0, react_jsx_runtime.jsx)(CloseIcon, {})
					})]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: file_peek_module_css_default.note,
					children: t("peek.loading")
				})]
			});
			if (state.kind === "error") return (0, react_jsx_runtime.jsxs)("div", {
				className: file_peek_module_css_default.peek,
				"data-diff-stat-peek": "",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: file_peek_module_css_default.bar,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: file_peek_module_css_default.barText,
						children: path
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: file_peek_module_css_default.close,
						"aria-label": closeLabel,
						onClick: onClose,
						children: (0, react_jsx_runtime.jsx)(CloseIcon, {})
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: file_peek_module_css_default.note,
					children: [state.key === "hostUnavailable" ? t("peek.hostUnavailable") : t("peek.readFailed"), state.detail !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
						className: file_peek_module_css_default.detail,
						children: ["：", state.detail]
					})]
				})]
			});
			if (state.kind === "binary") return (0, react_jsx_runtime.jsxs)("div", {
				className: file_peek_module_css_default.peek,
				"data-diff-stat-peek": "",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: file_peek_module_css_default.bar,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: file_peek_module_css_default.barText,
						children: path
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: file_peek_module_css_default.close,
						"aria-label": closeLabel,
						onClick: onClose,
						children: (0, react_jsx_runtime.jsx)(CloseIcon, {})
					})]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: file_peek_module_css_default.note,
					children: t("peek.binary", { size: state.size })
				})]
			});
			const lines = contentLines(state.content);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: file_peek_module_css_default.peek,
				"data-diff-stat-peek": "",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: file_peek_module_css_default.bar,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: file_peek_module_css_default.barText,
							children: path
						}),
						(0, react_jsx_runtime.jsxs)("span", { children: [t("peek.bytes", { size: state.size }), state.truncated ? " · " + t("peek.truncated") : ""] }),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: file_peek_module_css_default.close,
							"aria-label": closeLabel,
							onClick: onClose,
							children: (0, react_jsx_runtime.jsx)(CloseIcon, {})
						})
					]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: file_peek_module_css_default.body,
					children: lines.map((line, index) => (0, react_jsx_runtime.jsxs)("div", {
						className: file_peek_module_css_default.line,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: file_peek_module_css_default.no,
							"aria-hidden": true,
							children: index + 1
						}), (0, react_jsx_runtime.jsx)("span", {
							className: file_peek_module_css_default.tx,
							children: line
						})]
					}, String(index)))
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/turn-card.module.css.mjs
		const css = ".turn-card-module_card{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f40);background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-primary);border-radius:8px;margin:6px 0 2px;overflow:hidden}.turn-card-module_header{box-sizing:border-box;color:inherit;font:inherit;cursor:pointer;text-align:left;background:0 0;border:none;border-radius:6px;align-items:center;gap:6px;padding:6px 10px;display:flex}.turn-card-module_header:hover{background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .12s;display:inline-flex}.turn-card-module_chevronOpen{transform:rotate(90deg)}.turn-card-module_summary{color:var(--dsw-alias-label-secondary)}.turn-card-module_badge{font-variant-numeric:tabular-nums;gap:6px;display:inline-flex}.turn-card-module_add{color:var(--dsw-alias-state-success-primary)}.turn-card-module_del{color:var(--dsw-alias-state-error-primary)}.turn-card-module_undo{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:none;border-radius:5px;flex:none;margin-left:auto;padding:1px 6px;font-size:12px}.turn-card-module_undo:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_undo:disabled{cursor:default;opacity:.6}.turn-card-module_undoDone{color:var(--dsw-alias-state-success-primary)}.turn-card-module_list{border-top:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);flex-direction:column;gap:1px;margin:0 4px 4px;padding:2px 6px 4px;display:flex}.turn-card-module_fileRow{border-radius:6px;align-items:center;gap:6px;min-height:24px;padding:2px 8px;display:flex}.turn-card-module_fileRow:hover{background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_fileIcon{color:var(--dsw-alias-label-tertiary);flex:none;display:inline-flex}.turn-card-module_fileName{color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:none;padding:0}.turn-card-module_fileName:hover{text-decoration:underline}.turn-card-module_dir{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;max-width:40%;overflow:hidden}.turn-card-module_rowBadge{font-variant-numeric:tabular-nums;flex:none;gap:5px;margin-left:auto;display:inline-flex}.turn-card-module_actions{flex:none;align-items:center;gap:2px;display:inline-flex}.turn-card-module_action{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:none;border-radius:5px;align-items:center;gap:3px;padding:1px 6px;font-size:12px;display:inline-flex}.turn-card-module_action:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_actionActive{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-active,#7f7f7f24)}.turn-card-module_action.turn-card-module_actionActive,.turn-card-module_action.turn-card-module_actionActive:hover{background:var(--dsw-alias-fill-active,#7f7f7f24)}.turn-card-module_chip{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f59);border-radius:6px;padding:1px 7px}.turn-card-module_openSplit{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f59);border-radius:6px;align-items:stretch;display:inline-flex;overflow:hidden}.turn-card-module_openSplit:hover .turn-card-module_openMain,.turn-card-module_openSplit:hover .turn-card-module_openMore{background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_openSplit:hover .turn-card-module_openMain.turn-card-module_actionActive,.turn-card-module_openSplit:hover .turn-card-module_openMore.turn-card-module_actionActive{background:var(--dsw-alias-fill-active,#7f7f7f24)}.turn-card-module_openMain:focus-visible,.turn-card-module_openMore:focus-visible{outline:none;box-shadow:inset 0 0 0 2px}.turn-card-module_openMain{padding:1px 8px}.turn-card-module_openMore{justify-content:center;min-width:24px;padding:1px 4px}.turn-card-module_openDivider{background:var(--dsw-alias-border-secondary,#7f7f7f59);width:1px;margin:3px 0}.turn-card-module_diffWrap{margin:2px 0 6px}";
		const tagId = "dsh-diff-stat/turn-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-diff-stat";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var turn_card_module_css_default = {
			"action": "turn-card-module_action",
			"actionActive": "turn-card-module_actionActive",
			"actions": "turn-card-module_actions",
			"add": "turn-card-module_add",
			"badge": "turn-card-module_badge",
			"card": "turn-card-module_card",
			"chevron": "turn-card-module_chevron",
			"chevronOpen": "turn-card-module_chevronOpen",
			"chip": "turn-card-module_chip",
			"del": "turn-card-module_del",
			"diffWrap": "turn-card-module_diffWrap",
			"dir": "turn-card-module_dir",
			"fileIcon": "turn-card-module_fileIcon",
			"fileName": "turn-card-module_fileName",
			"fileRow": "turn-card-module_fileRow",
			"header": "turn-card-module_header",
			"list": "turn-card-module_list",
			"openDivider": "turn-card-module_openDivider",
			"openMain": "turn-card-module_openMain",
			"openMore": "turn-card-module_openMore",
			"openSplit": "turn-card-module_openSplit",
			"rowBadge": "turn-card-module_rowBadge",
			"summary": "turn-card-module_summary",
			"undo": "turn-card-module_undo",
			"undoDone": "turn-card-module_undoDone"
		};
		//#endregion
		//#region src/client/turn-card.tsx
		function dirname(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? "" : path.slice(0, at);
		}
		const EMPTY_FILES = [];
		function totals(files) {
			let added = 0;
			let removed = 0;
			for (const file of files) {
				const s = diffStats(file.diffs);
				added += s.added;
				removed += s.removed;
			}
			return {
				added,
				removed
			};
		}
		function TurnCard(props) {
			const { matched, turn, sessionId, openFile, getCwd, t, useChat } = props;
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [openFilePath, setOpenFilePath] = (0, react.useState)(null);
			const [revealed, setRevealed] = (0, react.useState)(() => new Set());
			const [peeked, setPeeked] = (0, react.useState)(() => new Set());
			const [hostReady, setHostReady] = (0, react.useState)(false);
			const [undoState, setUndoState] = (0, react.useState)("idle");
			const [prepared, setPrepared] = (0, react.useState)(() => new Map());
			const snapshot = useChat === void 0 ? void 0 : useChat((s) => s);
			const joinCache = (0, react.useRef)(null);
			const dispatchFiles = (0, react.useMemo)(() => {
				if (snapshot === void 0 || turn === void 0) {
					joinCache.current = null;
					return EMPTY_FILES;
				}
				const joined = extractDispatchFiles(snapshot.locations, snapshot.nodes, turn.turn, joinCache.current);
				joinCache.current = joined.next;
				return joined.files;
			}, [snapshot, turn]);
			const allFiles = (0, react.useMemo)(() => mergeChangedFiles(matched, dispatchFiles), [matched, dispatchFiles]);
			const total = (0, react.useMemo)(() => totals(allFiles), [allFiles]);
			const statsByPath = (0, react.useMemo)(() => {
				const map = new Map();
				for (const file of allFiles) map.set(file.path, diffStats(file.diffs));
				return map;
			}, [allFiles]);
			const cwd = (0, react.useMemo)(() => getCwd?.(sessionId), [getCwd, sessionId]);
			const allFilesRef = (0, react.useRef)(allFiles);
			allFilesRef.current = allFiles;
			const preparedRef = (0, react.useRef)(prepared);
			preparedRef.current = prepared;
			(0, react.useEffect)(() => {
				if (revealed.size === 0) return;
				let alive = true;
				(async () => {
					for (const path of revealed) {
						const file = allFilesRef.current.find((candidate) => candidate.path === path);
						if (file === void 0) continue;
						const entry = preparedRef.current.get(path);
						if (entry !== void 0 && entry.input === file.diffs && entry.window !== null) continue;
						const next = await prepareDiffWindow(file.diffs, path, cwd);
						if (!alive) return;
						setPrepared((prev) => {
							const map = new Map(prev);
							map.set(path, {
								input: file.diffs,
								window: next
							});
							return map;
						});
					}
				})();
				return () => {
					alive = false;
				};
			}, [
				revealed,
				cwd,
				allFiles
			]);
			(0, react.useEffect)(() => {
				let alive = true;
				hostAvailable().then((available) => {
					if (alive) setHostReady(available);
				});
				return () => {
					alive = false;
				};
			}, []);
			const togglePeeked = (0, react.useCallback)((path) => {
				setPeeked((prev) => {
					const next = new Set(prev);
					if (next.has(path)) next.delete(path);
					else next.add(path);
					return next;
				});
			}, []);
			const undoBusy = (0, react.useRef)(false);
			const undoTurn = (0, react.useCallback)(() => {
				if (undoState === "busy" || undoBusy.current) return;
				undoBusy.current = true;
				setUndoState("busy");
				(async () => {
					const result = await hostCall("undo", {
						cwd,
						turn: turn?.turn,
						session: sessionId,
						files: allFiles.map((file) => ({
							path: file.path,
							diffs: file.diffs.map((hunk) => ({
								oldText: hunk.oldText,
								newText: hunk.newText
							}))
						}))
					});
					if (result !== null && result.ok) for (const file of allFiles) invalidateBoostCache(file.path, cwd);
					else undoBusy.current = false;
					setUndoState(result !== null && result.ok ? "done" : "error");
				})();
			}, [
				undoState,
				cwd,
				allFiles,
				turn,
				sessionId
			]);
			const toggleRevealed = (0, react.useCallback)((path) => {
				setRevealed((prev) => {
					const next = new Set(prev);
					if (next.has(path)) next.delete(path);
					else next.add(path);
					return next;
				});
			}, []);
			const copyPath = (0, react.useCallback)((path) => {
				const root = (getCwd?.(sessionId) ?? "").replace(/[/\\]+$/, "");
				const rel = root !== "" && (path.startsWith(root + "/") || path.startsWith(root + "\\")) ? path.slice(root.length + 1) : path;
				(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(rel);
			}, [getCwd, sessionId]);
			const menuItems = (0, react.useMemo)(() => [
				{
					id: "peek",
					label: t("card.peek"),
					icon: (0, react_jsx_runtime.jsx)(EyeIcon, {})
				},
				{
					id: "open",
					label: t("card.openSystem"),
					icon: (0, react_jsx_runtime.jsx)(ExternalLinkIcon, {})
				},
				...hostReady ? [{
					id: "explorer",
					label: t("card.showInExplorer"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 13 })
				}, {
					id: "vscode",
					label: t("card.openInVscode"),
					icon: (0, react_jsx_runtime.jsx)(VSCodeIcon, {})
				}] : [],
				{
					type: "separator",
					id: "sep-copy"
				},
				{
					id: "copy-abs",
					label: t("card.copyAbs"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, { size: 13 })
				},
				{
					id: "copy-rel",
					label: t("card.copyRel"),
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCopyOutline16, { size: 13 })
				}
			], [hostReady, t]);
			const onMenuSelect = (0, react.useCallback)((id, path) => {
				if (id === "peek") togglePeeked(path);
				else if (id === "open") openFile(path);
				else if (id === "explorer") hostCall("open-with", {
					cwd,
					path,
					target: "explorer"
				});
				else if (id === "vscode") hostCall("open-with", {
					cwd,
					path,
					target: "vscode"
				});
				else if (id === "copy-abs") (0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(path);
				else if (id === "copy-rel") copyPath(path);
			}, [
				openFile,
				copyPath,
				togglePeeked,
				cwd
			]);
			if (allFiles.length === 0) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: turn_card_module_css_default.card,
				"data-diff-stat-card": "",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: turn_card_module_css_default.header,
					role: "button",
					tabIndex: 0,
					"aria-expanded": expanded,
					onClick: () => {
						setExpanded((v) => !v);
					},
					onKeyDown: (event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							setExpanded((v) => !v);
						}
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: turn_card_module_css_default.chevron + (expanded ? " " + turn_card_module_css_default.chevronOpen : ""),
							"aria-hidden": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { size: 12 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: turn_card_module_css_default.summary,
							children: t("card.filesChanged", { count: allFiles.length })
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: turn_card_module_css_default.badge,
							"data-diffstat": "",
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: turn_card_module_css_default.add,
								children: ["+", total.added]
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: turn_card_module_css_default.del,
								children: ["−", total.removed]
							})]
						}),
						hostReady && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: turn_card_module_css_default.undo + (undoState === "done" ? " " + turn_card_module_css_default.undoDone : ""),
							disabled: undoState === "busy" || undoState === "done",
							title: undoState === "error" ? t("card.undoFailedTitle") : t("card.undoTitle"),
							onClick: (event) => {
								event.stopPropagation();
								undoTurn();
							},
							children: undoState === "busy" ? t("card.undoing") : undoState === "done" ? t("card.undone") : undoState === "error" ? t("card.undoFailed") : "↶ " + t("card.undo")
						})
					]
				}), expanded && (0, react_jsx_runtime.jsx)("div", {
					className: turn_card_module_css_default.list,
					children: allFiles.map((file) => {
						const name = basename(file.path);
						const dir = dirname(file.path);
						const stats = statsByPath.get(file.path) ?? {
							added: 0,
							removed: 0
						};
						const revealedFile = revealed.has(file.path);
						const preparedEntry = prepared.get(file.path);
						const preparedWindow = preparedEntry !== void 0 && preparedEntry.input === file.diffs && preparedEntry.window !== null ? preparedEntry.window : null;
						return (0, react_jsx_runtime.jsxs)("div", {
							"data-diff-stat-file": file.path,
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: turn_card_module_css_default.fileRow,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: turn_card_module_css_default.fileIcon,
											"aria-hidden": true,
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
												path: file.path,
												size: 16
											})
										}),
										(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: turn_card_module_css_default.fileName,
											title: file.path,
											onClick: () => {
												toggleRevealed(file.path);
											},
											children: name
										}),
										dir !== "" && (0, react_jsx_runtime.jsx)("span", {
											className: turn_card_module_css_default.dir,
											children: dir
										}),
										(0, react_jsx_runtime.jsxs)("span", {
											className: turn_card_module_css_default.rowBadge,
											"data-diffstat": "",
											children: [(0, react_jsx_runtime.jsxs)("span", {
												className: turn_card_module_css_default.add,
												children: ["+", stats.added]
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: turn_card_module_css_default.del,
												children: ["−", stats.removed]
											})]
										}),
										(0, react_jsx_runtime.jsxs)("span", {
											className: turn_card_module_css_default.actions,
											children: [(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: turn_card_module_css_default.action + " " + turn_card_module_css_default.chip + (revealedFile ? " " + turn_card_module_css_default.actionActive : ""),
												onClick: () => {
													toggleRevealed(file.path);
												},
												children: t("card.review")
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: turn_card_module_css_default.openSplit,
												children: [
													(0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: turn_card_module_css_default.action + " " + turn_card_module_css_default.openMain + (peeked.has(file.path) ? " " + turn_card_module_css_default.actionActive : ""),
														title: t("card.peek"),
														onClick: () => {
															togglePeeked(file.path);
														},
														children: t("card.open")
													}),
													(0, react_jsx_runtime.jsx)("span", {
														className: turn_card_module_css_default.openDivider,
														"aria-hidden": true
													}),
													(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
														open: openFilePath === file.path,
														anchor: (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: turn_card_module_css_default.action + " " + turn_card_module_css_default.openMore + (openFilePath === file.path ? " " + turn_card_module_css_default.actionActive : ""),
															"aria-label": t("card.openMore"),
															"aria-haspopup": "menu",
															"aria-expanded": openFilePath === file.path,
															onClick: () => {
																setOpenFilePath((current) => current === file.path ? null : file.path);
															},
															children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { size: 11 })
														}),
														items: menuItems,
														onSelect: (id) => {
															onMenuSelect(id, file.path);
															setOpenFilePath(null);
														},
														onClose: () => {
															setOpenFilePath(null);
														},
														align: "end",
														compact: true,
														portal: true
													})
												]
											})]
										})
									]
								}),
								revealedFile && (0, react_jsx_runtime.jsx)("div", {
									className: turn_card_module_css_default.diffWrap,
									children: (0, react_jsx_runtime.jsx)(DiffWindow, {
										diffs: preparedWindow !== null ? preparedWindow.diffs : file.diffs,
										bases: preparedWindow !== null ? preparedWindow.bases : void 0,
										maxHeight: 320
									})
								}),
								peeked.has(file.path) && (0, react_jsx_runtime.jsx)(FilePeek, {
									path: file.path,
									cwd,
									t,
									onClose: () => {
										togglePeeked(file.path);
									}
								})
							]
						}, file.path);
					})
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		const NS = "diff-stat";
		const zh = {
			"card.filesChanged": "{count} 个文件已更改",
			"card.undo": "撤销",
			"card.undoing": "撤销中…",
			"card.undone": "已撤销",
			"card.undoFailed": "撤销失败",
			"card.undoFailedTitle": "撤销失败：文件可能已在此轮之外被改动",
			"card.undoTitle": "把这一轮改动的文件恢复到轮前状态",
			"card.review": "审查",
			"card.open": "打开",
			"card.openMore": "更多打开方式",
			"card.openSystem": "系统打开",
			"card.peek": "内嵌查看",
			"card.showInExplorer": "资源管理器中显示",
			"card.openInVscode": "在 VS Code 中打开",
			"card.copyAbs": "复制绝对路径",
			"card.copyRel": "复制相对路径",
			"peek.loading": "读取中…",
			"peek.hostUnavailable": "host API 不可用",
			"peek.readFailed": "读取失败",
			"peek.binary": "二进制文件（{size} 字节），无法预览",
			"peek.bytes": "{size} 字节",
			"peek.truncated": "已截断（读取上限内的前段）",
			"peek.close": "关闭"
		};
		const en = {
			"card.filesChanged": "{count} files changed",
			"card.undo": "Undo",
			"card.undoing": "Undoing…",
			"card.undone": "Undone",
			"card.undoFailed": "Undo failed",
			"card.undoFailedTitle": "Undo failed: files may have changed outside this turn",
			"card.undoTitle": "Revert this turn's file changes to their pre-turn state",
			"card.review": "Review",
			"card.open": "Open",
			"card.openMore": "More ways to open",
			"card.openSystem": "Open with system",
			"card.peek": "View inline",
			"card.showInExplorer": "Show in Explorer",
			"card.openInVscode": "Open in VS Code",
			"card.copyAbs": "Copy absolute path",
			"card.copyRel": "Copy relative path",
			"peek.loading": "Loading…",
			"peek.hostUnavailable": "host API unavailable",
			"peek.readFailed": "Read failed",
			"peek.binary": "Binary file ({size} bytes); no preview",
			"peek.bytes": "{size} bytes",
			"peek.truncated": "truncated (head of the read cap)",
			"peek.close": "Close"
		};
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"sessions",
			"locale",
			"uiConversation"
		];
		const MUTATION_TOOLS = [
			"edit",
			"write",
			"str_replace_editor"
		];
		function apply(ctx) {
			const sessions = ctx.sessions;
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-diff-stat: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("tool.call.toolview", function* () {
				for (const key of MUTATION_TOOLS) yield ctx.slots.register({
					name: "tool.call.toolview",
					key,
					priority: -1
				}, MutationRow);
			});
			ctx.effect(() => {
				let unregister;
				const unsubscribe = subscribeGlassReady((glass) => {
					if (glass.version !== 1) return;
					if (glass.bridgeId !== "deepseek-harness-background") return;
					unregister?.();
					const offToken = glass.register({
						plugin: "dsh-diff-stat",
						selectors: [
							"[data-diff-window]",
							"[data-diff-stat-peek]",
							"[data-diff-stat-io]"
						],
						mode: "token"
					});
					const offFill = glass.register({
						plugin: "dsh-diff-stat",
						selectors: ["[data-diff-stat-card]"],
						mode: "fill"
					});
					unregister = () => {
						offToken();
						offFill();
					};
				});
				return () => {
					unregister?.();
					unsubscribe();
				};
			}, "dsh-diff-stat: frosted-glass surfaces");
			const snapshotFromStart = (definition) => {
				const baseStart = definition.start;
				return {
					...definition,
					start: (context, match, reader) => {
						const turnNo = match.event.data.turn;
						if (typeof turnNo === "number") {
							const list = sessions.list.getSnapshot();
							const sessionId = list.current;
							const cwd = sessionId === void 0 ? void 0 : list.byId[sessionId]?.cwd;
							if (cwd !== void 0 && cwd !== "") hostCall("snapshot", {
								cwd,
								session: sessionId,
								turn: turnNo
							});
						}
						return baseStart(context, match, reader);
					}
				};
			};
			ctx.uiConversation.events.register(snapshotFromStart(turnChangesDefinition));
			ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				priority: -1,
				select: selectChangedFiles,
				inject: () => ({
					getCwd: (sessionId) => sessionId === void 0 ? void 0 : sessions.list.getSnapshot().byId[sessionId]?.cwd,
					t
				})
			}, TurnCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
