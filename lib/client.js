window.__ModuleLoader__.load({
	id: "dsh-diff-stat",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region src/client/glass.ts
		const GLASS_GLOBAL = "__DSH_BACKGROUND_GLASS__";
		const GLASS_EVENT = "dsh-background-glass:ready";
		function subscribeGlassReady(listener) {
			const existing = window[GLASS_GLOBAL];
			if (existing !== void 0) listener(existing);
			const onReady = (event) => {
				listener(event.detail);
			};
			window.addEventListener(GLASS_EVENT, onReady);
			return () => {
				window.removeEventListener(GLASS_EVENT, onReady);
			};
		}
		//#endregion
		//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
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
		//#region \0dsh-css:src/client/tool-row.module.css.mjs
		const css$4 = ".tool-row-module_root{flex-direction:column;display:flex}.tool-row-module_row{position:relative;overflow:hidden}.tool-row-module_root[data-state=running] .tool-row-module_row:after{content:\"\";background:linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--dsw-alias-bg-base) 60%, transparent) 55%, transparent 100%);pointer-events:none;width:300px;animation:2.6s ease-out infinite tool-row-module_dsh-tool-row-sweep;position:absolute;top:0;bottom:0;left:0}@keyframes tool-row-module_dsh-tool-row-sweep{0%{left:-300px}90%,to{left:100%}}.tool-row-module_leading{flex-shrink:0}.tool-row-module_root[data-tool^=cordis_] .tool-row-module_leading,.tool-row-module_root[data-tool^=cordis_] .tool-row-module_title{color:var(--dsw-alias-state-business-primary)}.tool-row-module_root[data-tool^=cordis_] .tool-row-module_title{font-weight:500}.tool-row-module_root[data-tool^=cordis_] .tool-row-module_sep{background:var(--dsw-alias-state-business-primary)}.tool-row-module_chevron{color:var(--dsw-alias-label-secondary)}.tool-row-module_title{font-weight:400}.tool-row-module_sep{background:var(--dsw-alias-label-caption);border-radius:1px;flex:none;width:2px;height:2px;margin:0 8px}.tool-row-module_summary{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-tertiary);flex:auto;font-size:14px;line-height:24px;overflow:hidden}.tool-row-module_summarySuffix{white-space:nowrap;color:var(--dsw-alias-label-tertiary);flex:none;margin-left:4px;font-size:14px;line-height:24px}.tool-row-module_fileLink{text-overflow:ellipsis;white-space:nowrap;min-width:0;font:inherit;text-align:left;color:var(--dsw-alias-label-secondary);text-decoration:underline;text-decoration-color:var(--dsw-alias-label-quaternary);text-underline-offset:3px;cursor:pointer;background:0 0;border:none;flex:auto;margin:0;padding:0;font-size:14px;line-height:24px;overflow:hidden}.tool-row-module_fileLink:hover{color:var(--dsw-alias-label-primary);text-decoration-color:currentColor}.tool-row-module_errorSummary{color:var(--dsw-alias-state-error-primary)}.tool-row-module_bodyWrap{flex-direction:column;display:flex}.tool-row-module_inspectButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:0;border-radius:999px;align-self:flex-start;align-items:center;gap:4px;margin:4px 0 2px 4px;padding:2px 8px;font-size:11px;line-height:16px;transition:opacity .1s;display:inline-flex}.tool-row-module_root:hover .tool-row-module_inspectButton,.tool-row-module_inspectButton:focus-visible{opacity:1}.tool-row-module_inspectButton:hover{background:var(--dsw-alias-interactive-bg-hover-solid);color:var(--dsw-alias-label-primary)}.tool-row-module_bodyScroll{max-height:260px;overflow-y:auto}.tool-row-module_ioCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block-small);border-radius:12px;flex-direction:column;margin:4px 0 4px 4px;display:flex}.tool-row-module_ioSection{grid-template-columns:max-content 1fr;align-items:baseline;column-gap:14px;max-height:150px;padding:12px 16px;display:grid;overflow-y:auto}.tool-row-module_ioSection::-webkit-scrollbar-thumb{background-clip:padding-box;border:2px solid #0000;border-radius:6px}.tool-row-module_ioSection::-webkit-scrollbar-track{margin:6px 0}.tool-row-module_ioLabel{color:var(--dsw-alias-label-caption);align-self:start;position:sticky;top:0}.tool-row-module_ioDivider{background:var(--dsw-alias-border-l2);flex:none;height:1px}.tool-row-module_ioText{white-space:pre-wrap;word-break:break-word;min-width:0;color:var(--dsw-alias-label-secondary)}.tool-row-module_ioText[data-error]{color:var(--dsw-alias-state-error-primary)}.tool-row-module_codeBody,.tool-row-module_terminalBody,.tool-row-module_diffBody,.tool-row-module_readBody,.tool-row-module_searchBody,.tool-row-module_webBody{margin:4px 0 4px 4px}.tool-row-module_searchRecovery{white-space:pre-wrap;overflow-wrap:anywhere;font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-tertiary);margin:4px 0 4px 4px}.tool-row-module_codeBody{--dsl-code-block-content-font:var(--dsw-font-markdown-code-block-small)}.tool-row-module_terminalBody{--dsl-terminal-font:var(--dsw-font-markdown-code-block-small);--dsl-terminal-line-height:18px;--dsl-terminal-output-max-height:224px;border:1px solid var(--dsw-alias-border-l1)}.tool-row-module_visuallyHidden{clip:rect(0 0 0 0);white-space:nowrap;width:1px;height:1px;position:absolute;overflow:hidden}";
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
		const css$3 = ".badge-module_badge{font:var(--dsw-font-xs-13);font-variant-numeric:tabular-nums;flex:none;gap:6px;margin-left:4px;padding:0 2px;display:inline-flex}.badge-module_add{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 78%, var(--dsw-alias-label-primary))}.badge-module_del{color:var(--dsw-alias-state-error-primary)}.badge-module_linkFit{white-space:nowrap;text-overflow:ellipsis;vertical-align:bottom;flex:none;max-width:340px;display:inline-flex;overflow:hidden}";
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
			"del": "badge-module_del",
			"linkFit": "badge-module_linkFit"
		};
		//#endregion
		//#region src/client/diff-contract.ts
		function narrowDiffs(diffs) {
			if (!Array.isArray(diffs) || diffs.length === 0) return null;
			for (const hunk of diffs) {
				if (hunk === null || typeof hunk !== "object") return null;
				const { path, oldText, newText } = hunk;
				if (typeof path !== "string" || oldText !== null && typeof oldText !== "string" || typeof newText !== "string") return null;
			}
			return diffs;
		}
		function parseArgs(argsRaw) {
			try {
				const parsed = JSON.parse(argsRaw);
				return typeof parsed === "object" && parsed !== null ? parsed : void 0;
			} catch {
				return;
			}
		}
		function stringArg(args, key) {
			const value = args[key];
			return typeof value === "string" ? value : void 0;
		}
		function contentLines$1(text) {
			if (text === "") return [];
			return (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
		}
		function diffStats(diffs) {
			let added = 0;
			let removed = 0;
			for (const hunk of diffs) {
				if (hunk.oldText !== null) removed += contentLines$1(hunk.oldText).length;
				added += contentLines$1(hunk.newText).length;
			}
			return {
				added,
				removed
			};
		}
		function callTimeDiffs(toolName, argsRaw) {
			const args = parseArgs(argsRaw);
			if (args === void 0) return null;
			if (toolName === "write") {
				const path = stringArg(args, "file_path");
				const content = stringArg(args, "content");
				if (path === void 0 || content === void 0) return null;
				return [{
					path,
					oldText: null,
					newText: content
				}];
			}
			if (toolName === "edit") {
				const path = stringArg(args, "file_path");
				const oldString = stringArg(args, "old_string");
				const newString = stringArg(args, "new_string");
				if (path === void 0 || oldString === void 0 || newString === void 0) return null;
				return [{
					path,
					oldText: oldString || null,
					newText: newString
				}];
			}
			return null;
		}
		function callToolName(block) {
			return "kind" in block ? block.call?.name ?? "" : block.name;
		}
		function diffCardModel(block) {
			const toolName = callToolName(block);
			if (!("kind" in block)) {
				const call = block.callView?.card === "diff" ? block.callView : null;
				const diffs = call === null ? null : narrowDiffs(call.diffs);
				if (diffs !== null) return { card: { diffs } };
				const fallback = callTimeDiffs(toolName, block.argsRaw);
				return fallback === null ? null : { card: { diffs: fallback } };
			}
			const result = block.resultView?.card === "diff" ? block.resultView : null;
			const diffs = result === null ? null : narrowDiffs(result.diffs);
			if (diffs !== null) return { card: { diffs } };
			if (block.isError) return null;
			const fallback = callTimeDiffs(toolName, block.call?.argsRaw ?? "");
			return fallback === null ? null : { card: { diffs: fallback } };
		}
		function mutationHunks(toolName, argsRaw, callView, resultView) {
			const result = resultView !== null && resultView !== void 0 && resultView.card === "diff" ? narrowDiffs(resultView.diffs) : null;
			if (result !== null) return result;
			const call = callView !== null && callView !== void 0 && callView.card === "diff" ? narrowDiffs(callView.diffs) : null;
			if (call !== null) return call;
			return callTimeDiffs(toolName, argsRaw);
		}
		const ALIGN_MAX_SIDE_LINES = 1200;
		function lcsOps(oldLines, newLines) {
			const m = oldLines.length;
			const n = newLines.length;
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
		}
		function collapse(ops, context) {
			const keep = new Array(ops.length).fill(false);
			for (let k = 0; k < ops.length; k++) {
				if (ops[k].kind === "ctx") continue;
				for (let d = Math.max(0, k - context); d <= Math.min(ops.length - 1, k + context); d++) keep[d] = true;
			}
			const rows = [];
			let gapping = false;
			for (let k = 0; k < ops.length; k++) if (keep[k]) {
				rows.push({
					kind: ops[k].kind,
					text: ops[k].text
				});
				gapping = false;
			} else if (!gapping) {
				rows.push({
					kind: "gap",
					text: "⋯"
				});
				gapping = true;
			}
			return rows;
		}
		function alignedHunkRows(oldLines, newLines) {
			if (oldLines.length > ALIGN_MAX_SIDE_LINES || newLines.length > ALIGN_MAX_SIDE_LINES) return null;
			return collapse(lcsOps(oldLines, newLines), 3);
		}
		//#endregion
		//#region \0dsh-css:src/client/diff-window.module.css.mjs
		const css$2 = ".diff-window-module_window{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f33);background:var(--dsw-alias-markdown-code-block);border-radius:6px;overflow:hidden}.diff-window-module_scroll{white-space:pre;font:var(--dsw-font-markdown-code-block,var(--dsw-font-xs-13));width:max-content;min-width:100%;min-height:0;padding:4px 0;overflow:auto}.diff-window-module_line{min-height:var(--dsl-diff-line-height,18px);color:var(--dsw-alias-label-primary);padding:0 8px}.diff-window-module_path{color:var(--dsw-alias-label-tertiary);font-weight:600}.diff-window-module_ctx{color:var(--dsw-alias-label-secondary)}.diff-window-module_gap{color:var(--dsw-alias-label-tertiary)}.diff-window-module_add{color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 78%, var(--dsw-alias-label-primary));background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 7%, transparent)}.diff-window-module_del{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent)}body[data-dsh-bg-glass] [data-diff-window] .diff-window-module_add{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 13%, transparent)}body[data-dsh-bg-glass] [data-diff-window] .diff-window-module_del{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 13%, transparent)}.diff-window-module_footer{border-top:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);color:var(--dsw-alias-label-tertiary);padding:3px 8px}";
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
			"path": "diff-window-module_path",
			"scroll": "diff-window-module_scroll",
			"window": "diff-window-module_window"
		};
		//#endregion
		//#region src/client/diff-window.tsx
		function buildRows(diffs) {
			const rows = [];
			const paths = new Set();
			let added = 0;
			let removed = 0;
			let prevPath;
			for (const diff of diffs) {
				paths.add(diff.path);
				if (diff.path !== prevPath) rows.push({
					kind: "path",
					text: diff.path
				});
				else if (rows[rows.length - 1]?.kind !== "gap") rows.push({
					kind: "gap",
					text: "⋯"
				});
				prevPath = diff.path;
				const newLines = contentLines$1(diff.newText);
				const oldLines = diff.oldText === null ? [] : contentLines$1(diff.oldText);
				added += newLines.length;
				removed += oldLines.length;
				const aligned = alignedHunkRows(oldLines, newLines);
				if (aligned === null) {
					for (const line of oldLines) rows.push({
						kind: "del",
						text: line
					});
					for (const line of newLines) rows.push({
						kind: "add",
						text: line
					});
				} else for (const row of aligned) rows.push(row);
			}
			return {
				rows,
				added,
				removed,
				files: paths.size
			};
		}
		const ROW_CLASS = {
			path: diff_window_module_css_default.path,
			del: diff_window_module_css_default.del,
			add: diff_window_module_css_default.add,
			ctx: diff_window_module_css_default.ctx,
			gap: diff_window_module_css_default.gap
		};
		function DiffWindow({ diffs, maxHeight = 320 }) {
			const { rows, added, removed, files } = (0, react.useMemo)(() => buildRows(diffs), [diffs]);
			if (rows.length === 0) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: diff_window_module_css_default.window,
				"data-diff-window": "",
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: diff_window_module_css_default.scroll,
					style: { maxHeight },
					children: rows.map((row, index) => (0, react_jsx_runtime.jsx)("div", {
						className: diff_window_module_css_default.line + " " + ROW_CLASS[row.kind],
						children: row.text
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
		function rowModel(toolName, block, cwd) {
			const variant = toolName === "edit" ? "edit" : "write";
			const done = "kind" in block;
			const argsRaw = (done ? block.call?.argsRaw : block.argsRaw) ?? "";
			const state = !done ? "running" : block.error?.code === "interrupted" ? "stopped" : block.isError ? "error" : "ok";
			const parsed = parseArgs(argsRaw);
			const path = parsed !== void 0 ? typeof parsed["file_path"] === "string" && parsed["file_path"] !== "" ? parsed["file_path"] : typeof parsed["path"] === "string" ? parsed["path"] : void 0 : void 0;
			const rel = (text) => {
				if (cwd === void 0 || cwd === "") return text;
				const root = cwd.replace(/[/\\]+$/, "");
				if (text.startsWith(root + "/") || text.startsWith(root + "\\")) return text.slice(root.length + 1);
				return text;
			};
			const summary = path !== void 0 ? rel(path) : firstLine(argsRaw === "" ? block.callId : argsRaw);
			const output = done ? resultText(block) || null : null;
			return {
				variant,
				title: variant === "edit" ? "Edit" : "Write",
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
		function MutationRow({ toolName, block, cwd, openFile, inspect }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const model = rowModel(toolName, block, cwd);
			const diffBody = diffCardModel(block) ?? null;
			const stats = diffBody !== null && model.state !== "error" && model.state !== "stopped" ? diffStats(diffBody.card.diffs) : null;
			const outputText = model.output;
			const expandable = model.body !== null || outputText !== null || diffBody !== null;
			const open = expanded && expandable;
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
				if (event.key === "Enter" || event.key === " ") event.stopPropagation();
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
							className: clsx(tool_row_module_css_default.fileLink, badge_module_css_default.linkFit),
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
						children: [diffBody !== null ? (0, react_jsx_runtime.jsx)(DiffWindow, {
							diffs: diffBody.card.diffs,
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
		//#region src/client/turn-changes.ts
		function settledHunks(call, resultView) {
			if (call === void 0) return null;
			return mutationHunks(call.name, call.argsRaw, call.view ?? null, resultView ?? null);
		}
		function dispatchHunks(data) {
			if (data.isError !== false) return null;
			if (typeof data.rootCallId !== "string" || data.rootCallId === "") return null;
			if (typeof data.subCallId !== "string" || data.subCallId === "") return null;
			if (typeof data.name !== "string" || typeof data.arguments !== "string") return null;
			return mutationHunks(data.name, data.arguments, null, null);
		}
		function basename(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? path : path.slice(at + 1);
		}
		function codeDispatchData(event) {
			if (event.type !== "tool/code-dispatch") return null;
			return event.data ?? {};
		}
		function changesForClosing(data, seq = Number.POSITIVE_INFINITY) {
			if (data === void 0) return [];
			const files = [];
			const byPath = new Map();
			for (const entry of data.changed) {
				if (entry.seq > seq) continue;
				const existing = byPath.get(entry.path);
				if (existing === void 0) {
					const created = {
						path: entry.path,
						diffs: [...entry.diffs]
					};
					byPath.set(entry.path, created);
					files.push(created);
				} else existing.diffs.push(...entry.diffs);
			}
			return files;
		}
		function selectChangedFiles(owner) {
			const files = changesForClosing(owner.turn.data.get("diff-stat"), owner.seq);
			return files.length === 0 ? null : files;
		}
		const turnChangesDefinition = {
			kind: "diff-stat",
			match: (event) => {
				if (event.type === "turn/start") return {
					id: String(event.data.turn),
					role: "start"
				};
				if (event.type === "tool/call") return {
					id: String(event.data.turn),
					role: "update"
				};
				if (event.type === "tool/result" && (0, _deepseek_ai_dsh_client_runtime_client.isAppendSurfaceEvent)(event)) return {
					id: String(event.data.turn),
					role: "update"
				};
				const dispatch = codeDispatchData(event);
				if (dispatch !== null) {
					const turn = dispatch["turn"];
					return typeof turn === "number" ? {
						id: String(turn),
						role: "update"
					} : null;
				}
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "turn/start") throw new Error("diff-stat changes start requires turn/start");
				return {
					turn: match.event.data.turn,
					calls: new Map(),
					subCalls: new Set(),
					changed: []
				};
			},
			update: (context, match) => {
				if (match.event.type === "tool/call") {
					if (typeof match.event.data.callId !== "string" || match.event.data.callId === "") return context.state;
					const calls = new Map(context.state.calls);
					calls.set(match.event.data.callId, {
						name: String(match.event.data.name ?? ""),
						argsRaw: String(match.event.data.arguments ?? ""),
						view: match.view?.for === "call" ? match.view.view : null
					});
					return {
						...context.state,
						calls
					};
				}
				if (match.event.type === "tool/result") {
					if (match.event.data.message.content[0].isError === true) return context.state;
					const callId = match.event.data.message.source.callId;
					if (typeof callId !== "string" || callId === "") return context.state;
					const hunks = settledHunks(context.state.calls.get(callId), match.view?.for === "result" ? match.view.view : null);
					if (hunks === null || hunks.length === 0) return context.state;
					const path = hunks[0]?.path;
					if (path === void 0) return context.state;
					return {
						...context.state,
						changed: [...context.state.changed, {
							seq: match.event.seq,
							path,
							diffs: hunks
						}]
					};
				}
				const dispatch = codeDispatchData(match.event);
				if (dispatch !== null) {
					const data = dispatch;
					const hunks = dispatchHunks(data);
					if (hunks === null || hunks.length === 0) return context.state;
					const subCallId = String(data["subCallId"]);
					if (context.state.subCalls.has(subCallId)) return context.state;
					const subCalls = new Set(context.state.subCalls);
					subCalls.add(subCallId);
					const path = hunks[0]?.path;
					if (path === void 0) return context.state;
					return {
						...context.state,
						subCalls,
						changed: [...context.state.changed, {
							seq: match.event.seq,
							path,
							diffs: hunks
						}]
					};
				}
				return context.state;
			},
			buildLocationData: (context, scope) => scope !== "turn" || context.state === void 0 ? null : {
				kind: "turn",
				turn: context.state.turn,
				key: "diff-stat",
				value: { changed: context.state.changed }
			}
		};
		//#endregion
		//#region src/client/api.ts
		const BASE = "/dsh-diff-stat/api";
		async function hostCall(action, body) {
			try {
				const res = await fetch(BASE + "/" + action, {
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
					return (await fetch(BASE + "/ping")).ok;
				} catch {
					return false;
				}
			})();
			return probe;
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
		const css$1 = ".file-peek-module_peek{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f33);background:var(--dsw-alias-markdown-code-block);font:var(--dsw-font-markdown-code-block,var(--dsw-font-xs-13));border-radius:6px;overflow:hidden}.file-peek-module_bar{color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);align-items:center;gap:8px;padding:3px 8px;display:flex}.file-peek-module_barText{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.file-peek-module_close{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex:none;align-items:center;margin-left:auto;padding:1px 4px;display:inline-flex}.file-peek-module_close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}.file-peek-module_note{color:var(--dsw-alias-label-secondary);padding:6px 8px}.file-peek-module_body{white-space:pre;max-height:320px;padding:4px 0;overflow:auto}.file-peek-module_line{min-height:var(--dsl-diff-line-height,18px);color:var(--dsw-alias-label-primary);padding:0 8px}.file-peek-module_expand{border:none;border-top:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);width:100%;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;text-align:center;background:0 0;padding:3px 8px;display:block}.file-peek-module_expand:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}";
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
			"expand": "file-peek-module_expand",
			"line": "file-peek-module_line",
			"note": "file-peek-module_note",
			"peek": "file-peek-module_peek"
		};
		//#endregion
		//#region src/client/file-peek.tsx
		function contentLines(text) {
			if (text === "") return [];
			return (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
		}
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
						message: "host API 不可用"
					});
					else if (result.kind === "binary") setState({
						kind: "binary",
						size: result.size ?? 0
					});
					else if (typeof result.content !== "string") setState({
						kind: "error",
						message: result.error ?? "读取失败"
					});
					else setState({
						kind: "text",
						content: result.content,
						truncated: result.truncated === true,
						size: result.size ?? 0
					});
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
					children: [
						t("peek.readFailed"),
						"：",
						state.message
					]
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
					children: lines.map((line, index) => (0, react_jsx_runtime.jsx)("div", {
						className: file_peek_module_css_default.line,
						children: line
					}, String(index)))
				})]
			});
		}
		//#endregion
		//#region src/client/icon-paths.ts
		const ICON_VIEWBOX = "0 0 24 24";
		const LOGO_PATHS = {
			typescript: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
			javascript: "M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z",
			python: "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z",
			markdown: "M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z",
			rust: "M23.8346 11.7033l-1.0073-.6236a13.7268 13.7268 0 00-.0283-.2936l.8656-.8069a.3483.3483 0 00-.1154-.578l-1.1066-.414a8.4958 8.4958 0 00-.087-.2856l.6904-.9587a.3462.3462 0 00-.2257-.5446l-1.1663-.1894a9.3574 9.3574 0 00-.1407-.2622l.49-1.0761a.3437.3437 0 00-.0274-.3361.3486.3486 0 00-.3006-.154l-1.1845.0416a6.7444 6.7444 0 00-.1873-.2268l.2723-1.153a.3472.3472 0 00-.417-.4172l-1.1532.2724a14.0183 14.0183 0 00-.2278-.1873l.0415-1.1845a.3442.3442 0 00-.49-.328l-1.076.491c-.0872-.0476-.1742-.0952-.2623-.1407l-.1903-1.1673A.3483.3483 0 0016.256.955l-.9597.6905a8.4867 8.4867 0 00-.2855-.086l-.414-1.1066a.3483.3483 0 00-.5781-.1154l-.8069.8666a9.2936 9.2936 0 00-.2936-.0284L12.2946.1683a.3462.3462 0 00-.5892 0l-.6236 1.0073a13.7383 13.7383 0 00-.2936.0284L9.9803.3374a.3462.3462 0 00-.578.1154l-.4141 1.1065c-.0962.0274-.1903.0567-.2855.086L7.744.955a.3483.3483 0 00-.5447.2258L7.009 2.348a9.3574 9.3574 0 00-.2622.1407l-1.0762-.491a.3462.3462 0 00-.49.328l.0416 1.1845a7.9826 7.9826 0 00-.2278.1873L3.8413 3.425a.3472.3472 0 00-.4171.4171l.2713 1.1531c-.0628.075-.1255.1509-.1863.2268l-1.1845-.0415a.3462.3462 0 00-.328.49l.491 1.0761a9.167 9.167 0 00-.1407.2622l-1.1662.1894a.3483.3483 0 00-.2258.5446l.6904.9587a13.303 13.303 0 00-.087.2855l-1.1065.414a.3483.3483 0 00-.1155.5781l.8656.807a9.2936 9.2936 0 00-.0283.2935l-1.0073.6236a.3442.3442 0 000 .5892l1.0073.6236c.008.0982.0182.1964.0283.2936l-.8656.8079a.3462.3462 0 00.1155.578l1.1065.4141c.0273.0962.0567.1914.087.2855l-.6904.9587a.3452.3452 0 00.2268.5447l1.1662.1893c.0456.088.0922.1751.1408.2622l-.491 1.0762a.3462.3462 0 00.328.49l1.1834-.0415c.0618.0769.1235.1528.1873.2277l-.2713 1.1541a.3462.3462 0 00.4171.4161l1.153-.2713c.075.0638.151.1255.2279.1863l-.0415 1.1845a.3442.3442 0 00.49.327l1.0761-.49c.087.0486.1741.0951.2622.1407l.1903 1.1662a.3483.3483 0 00.5447.2268l.9587-.6904a9.299 9.299 0 00.2855.087l.414 1.1066a.3452.3452 0 00.5781.1154l.8079-.8656c.0972.0111.1954.0203.2936.0294l.6236 1.0073a.3472.3472 0 00.5892 0l.6236-1.0073c.0982-.0091.1964-.0183.2936-.0294l.8069.8656a.3483.3483 0 00.578-.1154l.4141-1.1066a8.4626 8.4626 0 00.2855-.087l.9587.6904a.3452.3452 0 00.5447-.2268l.1903-1.1662c.088-.0456.1751-.0931.2622-.1407l1.0762.49a.3472.3472 0 00.49-.327l-.0415-1.1845a6.7267 6.7267 0 00.2267-.1863l1.1531.2713a.3472.3472 0 00.4171-.416l-.2713-1.1542c.0628-.0749.1255-.1508.1863-.2278l1.1845.0415a.3442.3442 0 00.328-.49l-.49-1.076c.0475-.0872.0951-.1742.1407-.2623l1.1662-.1893a.3483.3483 0 00.2258-.5447l-.6904-.9587.087-.2855 1.1066-.414a.3462.3462 0 00.1154-.5781l-.8656-.8079c.0101-.0972.0202-.1954.0283-.2936l1.0073-.6236a.3442.3442 0 000-.5892zm-6.7413 8.3551a.7138.7138 0 01.2986-1.396.714.714 0 11-.2997 1.396zm-.3422-2.3142a.649.649 0 00-.7715.5l-.3573 1.6685c-1.1035.501-2.3285.7795-3.6193.7795a8.7368 8.7368 0 01-3.6951-.814l-.3574-1.6684a.648.648 0 00-.7714-.499l-1.473.3158a8.7216 8.7216 0 01-.7613-.898h7.1676c.081 0 .1356-.0141.1356-.088v-2.536c0-.074-.0536-.0881-.1356-.0881h-2.0966v-1.6077h2.2677c.2065 0 1.1065.0587 1.394 1.2088.0901.3533.2875 1.5044.4232 1.8729.1346.413.6833 1.2381 1.2685 1.2381h3.5716a.7492.7492 0 00.1296-.0131 8.7874 8.7874 0 01-.8119.9526zM6.8369 20.024a.714.714 0 11-.2997-1.396.714.714 0 01.2997 1.396zM4.1177 8.9972a.7137.7137 0 11-1.304.5791.7137.7137 0 011.304-.579zm-.8352 1.9813l1.5347-.6824a.65.65 0 00.33-.8585l-.3158-.7147h1.2432v5.6025H3.5669a8.7753 8.7753 0 01-.2834-3.348zm6.7343-.5437V8.7836h2.9601c.153 0 1.0792.1772 1.0792.8697 0 .575-.7107.7815-1.2948.7815zm10.7574 1.4862c0 .2187-.008.4363-.0243.651h-.9c-.09 0-.1265.0586-.1265.1477v.413c0 .973-.5487 1.1846-1.0296 1.2382-.4576.0517-.9648-.1913-1.0275-.4717-.2704-1.5186-.7198-1.8436-1.4305-2.4034.8817-.5599 1.799-1.386 1.799-2.4915 0-1.1936-.819-1.9458-1.3769-2.3153-.7825-.5163-1.6491-.6195-1.883-.6195H5.4682a8.7651 8.7651 0 014.907-2.7699l1.0974 1.151a.648.648 0 00.9182.0213l1.227-1.1743a8.7753 8.7753 0 016.0044 4.2762l-.8403 1.8982a.652.652 0 00.33.8585l1.6178.7188c.0283.2875.0425.577.0425.8717zm-9.3006-9.5993a.7128.7128 0 11.984 1.0316.7137.7137 0 01-.984-1.0316zm8.3389 6.71a.7107.7107 0 01.9395-.3625.7137.7137 0 11-.9405.3635z",
			html5: "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z",
			css3: "M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z",
			go: "M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z",
			php: "M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z",
			ruby: "M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z",
			openjdk: "M11.915 0 11.7.215C9.515 2.4 7.47 6.39 6.046 10.483c-1.064 1.024-3.633 2.81-3.711 3.551-.093.87 1.746 2.611 1.55 3.235-.198.625-1.304 1.408-1.014 1.939.1.188.823.011 1.277-.491a13.389 13.389 0 0 0-.017 2.14c.076.906.27 1.668.643 2.232.372.563.956.911 1.667.911.397 0 .727-.114 1.024-.264.298-.149.571-.33.91-.5.68-.34 1.634-.666 3.53-.604 1.903.062 2.872.39 3.559.704.687.314 1.15.664 1.925.664.767 0 1.395-.336 1.807-.9.412-.563.631-1.33.72-2.24.06-.623.055-1.32 0-2.066.454.45 1.117.604 1.213.424.29-.53-.816-1.314-1.013-1.937-.198-.624 1.642-2.366 1.549-3.236-.08-.748-2.707-2.568-3.748-3.586C16.428 6.374 14.308 2.394 12.13.215zm.175 6.038a2.95 2.95 0 0 1 2.943 2.942 2.95 2.95 0 0 1-2.943 2.943A2.95 2.95 0 0 1 9.148 8.98a2.95 2.95 0 0 1 2.942-2.942zM8.685 7.983a3.515 3.515 0 0 0-.145.997c0 1.951 1.6 3.55 3.55 3.55 1.95 0 3.55-1.598 3.55-3.55 0-.329-.046-.648-.132-.951.334.095.64.208.915.336a42.699 42.699 0 0 1 2.042 5.829c.678 2.545 1.01 4.92.846 6.607-.082.844-.29 1.51-.606 1.94-.315.431-.713.651-1.315.651-.593 0-.932-.27-1.673-.61-.741-.338-1.825-.694-3.792-.758-1.974-.064-3.073.293-3.821.669-.375.188-.659.373-.911.5s-.466.2-.752.2c-.53 0-.876-.209-1.16-.64-.285-.43-.474-1.101-.545-1.948-.141-1.693.176-4.069.823-6.614a43.155 43.155 0 0 1 1.934-5.783c.348-.167.749-.31 1.192-.425zm-3.382 4.362a.216.216 0 0 1 .13.031c-.166.56-.323 1.116-.463 1.665a33.849 33.849 0 0 0-.547 2.555 3.9 3.9 0 0 0-.2-.39c-.58-1.012-.914-1.642-1.16-2.08.315-.24 1.679-1.755 2.24-1.781zm13.394.01c.562.027 1.926 1.543 2.24 1.783-.246.438-.58 1.068-1.16 2.08a4.428 4.428 0 0 0-.163.309 32.354 32.354 0 0 0-.562-2.49 40.579 40.579 0 0 0-.482-1.652.216.216 0 0 1 .127-.03z",
			kotlin: "M24 24H0V0h24L12 12Z",
			swift: "M7.508 0c-.287 0-.573 0-.86.002-.241.002-.483.003-.724.01-.132.003-.263.009-.395.015A9.154 9.154 0 0 0 4.348.15 5.492 5.492 0 0 0 2.85.645 5.04 5.04 0 0 0 .645 2.848c-.245.48-.4.972-.495 1.5-.093.52-.122 1.05-.136 1.576a35.2 35.2 0 0 0-.012.724C0 6.935 0 7.221 0 7.508v8.984c0 .287 0 .575.002.862.002.24.005.481.012.722.014.526.043 1.057.136 1.576.095.528.25 1.02.495 1.5a5.03 5.03 0 0 0 2.205 2.203c.48.244.97.4 1.498.495.52.093 1.05.124 1.576.138.241.007.483.009.724.01.287.002.573.002.86.002h8.984c.287 0 .573 0 .86-.002.241-.001.483-.003.724-.01a10.523 10.523 0 0 0 1.578-.138 5.322 5.322 0 0 0 1.498-.495 5.035 5.035 0 0 0 2.203-2.203c.245-.48.4-.972.495-1.5.093-.52.124-1.05.138-1.576.007-.241.009-.481.01-.722.002-.287.002-.575.002-.862V7.508c0-.287 0-.573-.002-.86a33.662 33.662 0 0 0-.01-.724 10.5 10.5 0 0 0-.138-1.576 5.328 5.328 0 0 0-.495-1.5A5.039 5.039 0 0 0 21.152.645 5.32 5.32 0 0 0 19.654.15a10.493 10.493 0 0 0-1.578-.138 34.98 34.98 0 0 0-.722-.01C17.067 0 16.779 0 16.492 0H7.508zm6.035 3.41c4.114 2.47 6.545 7.162 5.549 11.131-.024.093-.05.181-.076.272l.002.001c2.062 2.538 1.5 5.258 1.236 4.745-1.072-2.086-3.066-1.568-4.088-1.043a6.803 6.803 0 0 1-.281.158l-.02.012-.002.002c-2.115 1.123-4.957 1.205-7.812-.022a12.568 12.568 0 0 1-5.64-4.838c.649.48 1.35.902 2.097 1.252 3.019 1.414 6.051 1.311 8.197-.002C9.651 12.73 7.101 9.67 5.146 7.191a10.628 10.628 0 0 1-1.005-1.384c2.34 2.142 6.038 4.83 7.365 5.576C8.69 8.408 6.208 4.743 6.324 4.86c4.436 4.47 8.528 6.996 8.528 6.996.154.085.27.154.36.213.085-.215.16-.437.224-.668.708-2.588-.09-5.548-1.893-7.992z",
			yaml: "m0 .97 4.111 6.453v4.09h2.638v-4.09L11.053.969H8.214L5.58 5.125 2.965.969Zm12.093.024-4.47 10.544h2.114l.97-2.345h4.775l.804 2.345h2.26L14.255.994Zm1.133 2.225 1.463 3.87h-3.096zm3.06 9.475v10.29H24v-2.199h-5.454v-8.091zm-12.175.002v10.335h2.217v-7.129l2.32 4.792h1.746l2.4-4.96v7.295h2.127V12.696h-2.904L9.44 17.37l-2.455-4.674Z",
			json: "M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 003.146-.863 12.404 12.404 0 003.793-2.542 11.977 11.977 0 002.44-3.427 11.794 11.794 0 001.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 00-.793-2.788 11.197 11.197 0 00-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 00-2.172-.87h-.005c.119.063.24.132.345.201.12.074.239.146.351.225a8.93 8.93 0 011.559 1.33c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 01-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a3.916 3.916 0 01-.748-.258 4.692 4.692 0 01-.779-.45 6.08 6.08 0 01-1.244-1.105 6.507 6.507 0 01-1.049-1.747 7.366 7.366 0 01-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 011.663-1.918c.225-.178.464-.333.704-.479l.016-.007a5.121 5.121 0 00-1.441-.12 4.963 4.963 0 00-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 00-.733.494c-.211.18-.42.36-.615.555-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 001.348 2.173 8.14 8.14 0 003.132 2.23 7.934 7.934 0 002.113.54c.074.015.149.015.209.015zm-2.934-.398a4.102 4.102 0 01-.45-.228 8.5 8.5 0 01-2.038-1.534c-1.094-1.137-1.827-2.566-2.247-4.08a15.184 15.184 0 01-.495-3.172 12.14 12.14 0 01.046-2.082c.135-1.257.495-2.501 1.124-3.58a6.889 6.889 0 011.783-2.053 6.23 6.23 0 011.633-.9 5.363 5.363 0 013.522-.045c.029 0 .029 0 .045.03.015.015.045.015.06.03.045.016.104.045.165.074.239.12.479.271.704.42a6.294 6.294 0 012.097 2.502c.42.914.615 1.934.631 2.938.014 1.079-.18 2.157-.645 3.146a6.42 6.42 0 01-2.638 2.832c.09.03.18.045.271.075.225.044.449.074.688.074 1.468.045 2.892-.66 3.94-1.647.195-.18.375-.375.54-.585.225-.27.435-.54.614-.823.239-.375.435-.75.614-1.154a8.112 8.112 0 00.509-1.664c.196-1.004.211-2.022.149-3.026-.135-2.022-.673-4.045-1.842-5.724a9.054 9.054 0 00-.555-.719 9.868 9.868 0 00-1.063-1.034 8.477 8.477 0 00-1.363-.915 9.927 9.927 0 00-1.692-.598l-.3-.06c-.209-.03-.42-.044-.634-.06a8.453 8.453 0 00-1.015.016c-.704.045-1.412.16-2.112.337C5.799 1.227 2.863 3.566 1.3 6.67A11.834 11.834 0 00.238 9.801a11.81 11.81 0 00-.104 3.775c.12 1.02.374 2.023.778 2.977.227.57.511 1.124.825 1.648 1.094 1.783 2.683 3.236 4.51 4.24.688.39 1.408.69 2.157.944.226.074.45.15.689.21z",
			toml: "M.014 0h5.34v2.652H2.888v18.681h2.468V24H.015V0Zm17.622 5.049v2.78h-4.274v12.935h-3.008V7.83H6.059V5.05h11.577ZM23.986 24h-5.34v-2.652h2.467V2.667h-2.468V0h5.34v24Z",
			svelte: "M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z",
			docker: "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"
		};
		//#endregion
		//#region src/client/file-type-icon.tsx
		const ICON_COLORS = {
			typescript: "#3178c6",
			javascript: "#f1e05a",
			python: "#3572a5",
			markdown: "#519aba",
			rust: "#dea584",
			html5: "#e34c26",
			css3: "#663399",
			go: "#00ADD8",
			php: "#4F5D95",
			ruby: "#701516",
			openjdk: "#b07219",
			kotlin: "#A97BFF",
			swift: "#F05138",
			yaml: "#cb171e",
			json: "#cbcb41",
			toml: "#9c4221",
			svelte: "#ff3e00",
			docker: "#2496ED"
		};
		const EXT_ICONS = {
			ts: "typescript",
			tsx: "typescript",
			mts: "typescript",
			cts: "typescript",
			js: "javascript",
			jsx: "javascript",
			mjs: "javascript",
			cjs: "javascript",
			py: "python",
			pyi: "python",
			md: "markdown",
			markdown: "markdown",
			rs: "rust",
			html: "html5",
			htm: "html5",
			xhtml: "html5",
			css: "css3",
			go: "go",
			php: "php",
			rb: "ruby",
			java: "openjdk",
			kt: "kotlin",
			kts: "kotlin",
			swift: "swift",
			yml: "yaml",
			yaml: "yaml",
			json: "json",
			jsonc: "json",
			toml: "toml",
			svelte: "svelte"
		};
		function extOf(path) {
			const base = path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
			if (/^dockerfile(\.\w+)?$/i.test(base)) return "@dockerfile";
			const dot = base.lastIndexOf(".");
			return dot === -1 ? "" : base.slice(dot + 1).toLowerCase();
		}
		function FileSilhouette({ color }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("path", {
					d: "M4 1.5h5.2L12.5 4.8v9.7a1 1 0 0 1-1 1h-7.5a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z",
					fill: color
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M9.2 1.5v3.3h3.3",
					fill: "none",
					stroke: "rgba(255,255,255,0.6)",
					strokeWidth: "1"
				})]
			});
		}
		function FileTypeIcon({ path }) {
			const ext = extOf(path);
			const icon = ext === "@dockerfile" ? "docker" : EXT_ICONS[ext];
			const d = icon === void 0 ? void 0 : LOGO_PATHS[icon];
			if (icon !== void 0 && d !== void 0) return (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: ICON_VIEWBOX,
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d,
					fill: ICON_COLORS[icon] ?? "var(--dsw-alias-label-tertiary)"
				})
			});
			return (0, react_jsx_runtime.jsx)(FileSilhouette, { color: "var(--dsw-alias-label-tertiary)" });
		}
		//#endregion
		//#region \0dsh-css:src/client/turn-card.module.css.mjs
		const css = ".turn-card-module_card{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f40);background:color-mix(in srgb, var(--dsw-alias-label-primary) 3%, transparent);font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-primary);border-radius:8px;margin:6px 0 2px;overflow:hidden}.turn-card-module_header{width:100%;color:inherit;font:inherit;cursor:pointer;text-align:left;background:0 0;border:none;border-radius:6px;align-items:center;gap:6px;padding:6px 10px;display:flex}.turn-card-module_header:hover{background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .12s;display:inline-flex}.turn-card-module_chevronOpen{transform:rotate(90deg)}.turn-card-module_summary{color:var(--dsw-alias-label-secondary)}.turn-card-module_badge{font-variant-numeric:tabular-nums;gap:6px;display:inline-flex}.turn-card-module_add{color:var(--dsw-alias-state-success-primary)}.turn-card-module_del{color:var(--dsw-alias-state-error-primary)}.turn-card-module_undo{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:none;border-radius:5px;flex:none;margin-left:auto;padding:1px 6px;font-size:12px}.turn-card-module_undo:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_undo:disabled{cursor:default;opacity:.6}.turn-card-module_undoDone{color:var(--dsw-alias-state-success-primary)}.turn-card-module_list{border-top:1px solid var(--dsw-alias-border-secondary,#7f7f7f26);flex-direction:column;gap:1px;margin:0 4px 4px;padding:2px 6px 4px;display:flex}.turn-card-module_fileRow{border-radius:6px;align-items:center;gap:6px;min-height:24px;padding:2px 8px;display:flex}.turn-card-module_fileRow:hover{background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_fileIcon{color:var(--dsw-alias-label-tertiary);flex:none;display:inline-flex}.turn-card-module_fileName{color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:none;padding:0}.turn-card-module_fileName:hover{text-decoration:underline}.turn-card-module_dir{color:var(--dsw-alias-label-tertiary);white-space:nowrap;text-overflow:ellipsis;max-width:40%;overflow:hidden}.turn-card-module_rowBadge{font-variant-numeric:tabular-nums;flex:none;gap:5px;margin-left:auto;display:inline-flex}.turn-card-module_actions{flex:none;align-items:center;gap:2px;display:inline-flex}.turn-card-module_action{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:none;border-radius:5px;align-items:center;gap:3px;padding:1px 6px;font-size:12px;display:inline-flex}.turn-card-module_action:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_actionActive{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-active,#7f7f7f24)}.turn-card-module_action.turn-card-module_actionActive,.turn-card-module_action.turn-card-module_actionActive:hover{background:var(--dsw-alias-fill-active,#7f7f7f24)}.turn-card-module_chip{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f59);border-radius:6px;padding:1px 7px}.turn-card-module_openSplit{border:1px solid var(--dsw-alias-border-secondary,#7f7f7f59);border-radius:6px;align-items:stretch;display:inline-flex;overflow:hidden}.turn-card-module_openSplit:hover .turn-card-module_openMain,.turn-card-module_openSplit:hover .turn-card-module_openMore{background:var(--dsw-alias-fill-hover,#7f7f7f14)}.turn-card-module_openSplit:hover .turn-card-module_openMain.turn-card-module_actionActive,.turn-card-module_openSplit:hover .turn-card-module_openMore.turn-card-module_actionActive{background:var(--dsw-alias-fill-active,#7f7f7f24)}.turn-card-module_openMain:focus-visible,.turn-card-module_openMore:focus-visible{outline:none;box-shadow:inset 0 0 0 2px}.turn-card-module_openMain{padding:1px 8px}.turn-card-module_openMore{justify-content:center;min-width:24px;padding:1px 4px}.turn-card-module_openDivider{background:var(--dsw-alias-border-secondary,#7f7f7f59);width:1px;margin:3px 0}.turn-card-module_diffWrap{max-width:720px;margin:2px 0 6px 30px}.turn-card-module_empty{color:var(--dsw-alias-label-tertiary);padding:2px 8px}";
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
			"empty": "turn-card-module_empty",
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
		function TurnCard({ matched, sessionId, openFile, getCwd, t }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [openFilePath, setOpenFilePath] = (0, react.useState)(null);
			const [revealed, setRevealed] = (0, react.useState)(() => new Set());
			const [peeked, setPeeked] = (0, react.useState)(() => new Set());
			const [hostReady, setHostReady] = (0, react.useState)(false);
			const [undoState, setUndoState] = (0, react.useState)("idle");
			const total = (0, react.useMemo)(() => totals(matched), [matched]);
			(0, react.useEffect)(() => {
				let alive = true;
				hostAvailable().then((available) => {
					if (alive) setHostReady(available);
				});
				return () => {
					alive = false;
				};
			}, []);
			const cwd = (0, react.useMemo)(() => getCwd?.(sessionId), [getCwd, sessionId]);
			const togglePeeked = (0, react.useCallback)((path) => {
				setPeeked((prev) => {
					const next = new Set(prev);
					if (next.has(path)) next.delete(path);
					else next.add(path);
					return next;
				});
			}, []);
			const undoTurn = (0, react.useCallback)(() => {
				if (undoState === "busy") return;
				setUndoState("busy");
				(async () => {
					const result = await hostCall("undo", {
						cwd,
						files: matched.map((file) => ({
							path: file.path,
							diffs: file.diffs.map((hunk) => ({
								oldText: hunk.oldText,
								newText: hunk.newText
							}))
						}))
					});
					setUndoState(result !== null && result.ok ? "done" : "error");
				})();
			}, [
				undoState,
				cwd,
				matched
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
			if (matched.length === 0) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: turn_card_module_css_default.card,
				"data-diff-stat-card": "",
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: turn_card_module_css_default.header,
					onClick: () => {
						setExpanded((v) => !v);
					},
					"aria-expanded": expanded,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: turn_card_module_css_default.chevron + (expanded ? " " + turn_card_module_css_default.chevronOpen : ""),
							"aria-hidden": true,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { size: 12 })
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: turn_card_module_css_default.summary,
							children: t("card.filesChanged", { count: matched.length })
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
					children: matched.map((file) => {
						const name = basename(file.path);
						const dir = dirname(file.path);
						const stats = diffStats(file.diffs);
						const revealedFile = revealed.has(file.path);
						return (0, react_jsx_runtime.jsxs)("div", {
							"data-diff-stat-file": file.path,
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: turn_card_module_css_default.fileRow,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: turn_card_module_css_default.fileIcon,
											"aria-hidden": true,
											children: (0, react_jsx_runtime.jsx)(FileTypeIcon, { path: file.path })
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
										diffs: file.diffs,
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
			"peek.truncated": "已截断（前 512 KiB）",
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
			"peek.truncated": "truncated (first 512 KiB)",
			"peek.close": "Close"
		};
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"conversationEvents",
			"sessions",
			"locale"
		];
		const MUTATION_TOOLS = ["edit", "write"];
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
			ctx.conversationEvents.register(turnChangesDefinition);
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
