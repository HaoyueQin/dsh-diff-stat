# DSH Diff Stat

[English](README.md) | [中文](README.zh.md)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)
[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![npm](https://img.shields.io/npm/v/dsh-diff-stat?style=flat-square)](https://www.npmjs.com/package/dsh-diff-stat) [![npm downloads](https://img.shields.io/npm/dt/dsh-diff-stat?style=flat-square)](https://www.npmjs.com/package/dsh-diff-stat)
[![dsh](https://img.shields.io/badge/dsh-%E2%89%A50.1.1--rc-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
![platform](https://img.shields.io/badge/platform-web-8A9CF5?style=flat-square)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![i18n](https://img.shields.io/badge/i18n-zh%20%7C%20en-success?style=flat-square)

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that visualizes agent file changes: inline **+N −M** badges on mutation tool rows, a per-turn file-change summary card, and full aligned diffs on click. Covers native `edit`/`write` calls, the minimal preset's `str_replace_editor`, and Code Dispatch (PTC) sub-calls end to end. No git dependency, no third-party plugin dependencies.

## Features

- **Inline +N −M badges** — takes over the stock mutation rows for `edit`, `write` and `str_replace_editor` (keyed lower-priority shadow; uninstall restores stock). Counts are the real changed lines — the same LCS walk the diff renders — estimated from the arguments while running, exact from the result view once settled
- **Aligned diff window** — expanding a row opens a height-capped scrollable unified view. Both sides are LCS-aligned first: shared lines render as up to ±3 lines of context around each change, untouched runs collapse into ⋯, and the footer counts exactly the rendered rows
- **Per-turn summary card** — a collapsible "N files changed +X −Y" bar at each turn's tail; per-file rows with type icons, directory, ±lines, review, open ▾ and undo. Same-file edits merge and accumulate in settlement order
- **Code Dispatch (PTC), end to end** — dispatch sub-calls carry no wire diff view: rows fall back to the argument-derived diff, and the summary card joins their files from the stock chat tool tree, so a pure Code-Mode turn still gets its card. `subCallId` dedup keeps replays from double-counting
- **File-context boost** — bare argument fragments gain up to ±3 lines of real file context when expanded: the booster reads the file through the host's fenced API, locates the fragment's post-image and rebuilds the hunk (best-effort; unlocatable fragments keep their bare form)
- **Undo** — reverts the turn's files to their pre-turn state: reverse uniqueness-checked hunk peeling, created files deleted, drifted files rejected before any write, atomic commits
- **Inline view & open-with** — "open" expands a height-capped file preview below the row; the ▾ menu keeps system open, Explorer reveal, VS Code, and absolute/relative path copy
- **Frosted glass (optional)** — with [deepseek-harness-background](https://github.com/HaoyueQin/deepseek-harness-background) installed, every plugin surface joins its shared glass recipe; without it the stock opaque look stays untouched — graceful degradation, zero dependencies
- **zh / en** — copy follows the Web UI language (locale service)

## Screenshots

| Turn summary card | Taken-over row & aligned diff |
| --- | --- |
| ![turn summary card with per-file rows and inline preview](docs/images/glass-card-peek.png) | ![taken-over edit row with badge and aligned diff](docs/images/glass-diff-edit.png) |

Per-turn card with review / open / undo per file (left); an inline badge with its aligned diff window (right), both under the optional background glass.

## How it works

- **Badges & diffs**: registers the `edit`/`write`/`str_replace_editor` keys of the `tool.call.toolview` keyed slot at priority −1 (shadows the shipped rows). Diff data follows the authoritative chain resultView → callView → argument fallback, so a truncated window that dropped the call head still renders from the result view
- **Turn summary card**: a `ConversationNodeDefinition` accumulator (`turn/start`, `tool/call`, `tool/result(append)`, `tool/code-dispatch`) publishes Turn data; the `conversation.chat.turnTail` chain claims rendering — modeled on the official `ui-deliverables` plugin. Code-Dispatch files join from the stock chat tool tree, whose `tool-call` nodes already fold every dispatch into its root call's `subCalls`
- **Context boost**: argument-derived hunks are marked by object identity at construction; on expand the booster reads the file through the fenced API (LRU-cached), locates the fragment's post-image and rebuilds the hunk with shared lines. Anything unlocatable renders as-is
- **Host half (optional)**: a same-origin prefix route serves a fenced API — realpath containment checked before and after resolution, symlink rejection, UTF-8 round-trip validation, a 512 KiB read cap and atomic writes. When the host half is absent the dependent actions hide themselves
- **Frosted glass bridge (optional)**: a zero-dependency consumer of the background plugin's `window.__DSH_BACKGROUND_GLASS__` registry — subscribing to its ready event (both arrival orders + hot reload); the bridge never appearing leaves the ordinary UI untouched

## Install

```sh
# from npm
dsh plugin --profile web add dsh-diff-stat

# or from GitHub
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
pnpm install        # devDependencies; prepare builds lib/ automatically
pnpm build          # host half → lib/index.js + browser half → lib/client.js (one tsdown run)
pnpm typecheck      # both halves via tsc
pnpm check:align    # diff aligner & data-model assertions (needs Node >= 23.6)
```

## License

MIT
