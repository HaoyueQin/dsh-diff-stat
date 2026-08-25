# DSH Diff Stat

[English](README.md) | [中文](README.zh.md)

[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![npm](https://img.shields.io/npm/v/dsh-diff-stat?style=flat-square)](https://www.npmjs.com/package/dsh-diff-stat) [![npm downloads](https://img.shields.io/npm/dt/dsh-diff-stat?style=flat-square)](https://www.npmjs.com/package/dsh-diff-stat)
[![dsh](https://img.shields.io/badge/dsh-%E2%89%A50.1.1--rc-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
![platform](https://img.shields.io/badge/platform-web-8A9CF5?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
![i18n](https://img.shields.io/badge/i18n-zh%20%7C%20en-success?style=flat-square)

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin: inline **+N −M** badges on `edit`/`write` tool rows plus a per-turn file change summary card. Full unified diffs on click. Code Dispatch (PTC) nested sub-calls work via argument fallback — no wire diff view required. No git dependency, no third-party plugin dependencies.

## Features

- **Inline +N −M badges**: takes over the stock edit/write rows (keyed lower-priority shadow; uninstall restores stock automatically). Counts show while running from the argument-derived estimate, then switch to the exact result-view hunks on settlement
- **Full diff on click**: expands a unified diff rendered through the stock `DiffBlock` primitive (16-line capped collapse, copy, `└ +A -R` footer, theme tokens)
- **Per-turn summary card**: a collapsible "N files changed +X −Y" bar at each turn's tail; expands to per-file rows (per-type file icon · name · directory · ±lines · review · open | ▾). Same-file edits within a turn merge and accumulate
- **PTC / Code Dispatch fallback**: nested sub-calls carry no wire diff views; the plugin derives the call-time diff from the tools' own `presentCall` semantics (edit's old→new, write's whole-file create). `rootCallId+subCallId` dedup keeps replays from double-counting
- **Undo**: reverts the turn's files to their pre-turn state — reverse uniqueness-checked hunk peeling, deletes files the turn created, rejects drifted files before writing, atomic commits
- **Inline view**: clicking "open" expands a height-capped file content window below the row (16-line collapse, the stock DiffBlock interaction); the "▾" menu keeps every open-with route
- **Context folding**: before rendering, each hunk's sides are LCS-aligned — shared lines become ±3 lines of context around the change and untouched runs fold into ⋯; badge and footer totals stay full-scope
- **Frosted glass (optional)**: when [deepseek-harness-background](https://github.com/HaoyueQin/deepseek-harness-background) is installed, the diff window and file preview join its shared glass recipe (token mode). Without it they keep the stock opaque look — graceful degradation, zero dependencies
- **Open with**: system open (the stock `openFile`), reveal in Explorer, open in VS Code, copy absolute/relative path
- **zh / en**: copy follows the Web UI language (locale service)

## How it works

- **Inline badges**: register the `edit`/`write` keys of the `tool.call.toolview` keyed slot at priority −1 (shadows the shipped rows); diff data follows the authoritative chain resultView → callView → argument fallback (a truncated window that dropped the call head still renders from the result view)
- **Turn summary card**: a `ConversationNodeDefinition` accumulator (`turn/start` / `tool/call` / `tool/result(append)` / `tool/code-dispatch`) publishes Turn data; the `conversation.chat.turnTail` chain claims rendering — modeled on the official `ui-deliverables` plugin
- **Host half (optional)**: a same-origin prefix route serves a fenced API — realpath containment (checked before and after resolution), symlink rejection, UTF-8 round-trip validation, 512 KiB read cap, atomic writes. When the host half is absent the dependent actions hide themselves
- **Frosted glass bridge (optional)**: a zero-dependency consumer of the background plugin's `window.__DSH_BACKGROUND_GLASS__` registry. `[data-diff-window]` and `[data-diff-stat-peek]` register in token mode; the bridge never appearing leaves the ordinary UI untouched

## Install

```sh
# npm pack tarball (recommended; sidesteps the Windows local-dir link: junction bug)
dsh plugin --profile web add dsh-diff-stat-<version>.tgz

# or direct from GitHub — lib/ is committed, no build permission needed
dsh plugin --profile web add github:HaoyueQin/dsh-diff-stat

# restart dsh web to take effect
dsh web
```

Uninstall:

```sh
dsh plugin --profile web remove dsh-diff-stat
```

## Development

```sh
npm install --legacy-peer-deps          # devDependencies (peers are dsh-internal packages)
DSH_CHECKOUT=<dsh checkout> bash scripts/build.sh   # host half → lib/ (junction links + tsc)
npm run build:client                    # browser half → lib/client.js (tsdown)
npm run typecheck                       # both halves via tsc
```

## License

MIT