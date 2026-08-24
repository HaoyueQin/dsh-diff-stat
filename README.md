# DSH Diff Stat

[English](README.md) | [中文](README.zh.md)

[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![npm](https://img.shields.io/npm/v/dsh-diff-stat?style=flat-square)](https://www.npmjs.com/package/dsh-diff-stat)
[![dsh](https://img.shields.io/badge/dsh-%E2%89%A50.1.1--rc-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
![platform](https://img.shields.io/badge/platform-web-8A9CF5?style=flat-square)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue?style=flat-square)](LICENSE)
![i18n](https://img.shields.io/badge/i18n-zh%20%7C%20en-success?style=flat-square)

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin: inline **+N −M** badges on `edit`/`write` tool rows plus a per-turn file change summary card. Full unified diffs on click. Code Dispatch (PTC) nested sub-calls work via argument fallback — no wire diff view required. No git dependency, no third-party plugin dependencies.

## Features

- **Inline +N −M badges (R1)**: takes over the stock edit/write rows (keyed lower-priority shadow; uninstall restores stock automatically). Counts show while running from the argument-derived estimate, then switch to the exact result-view hunks on settlement
- **Full diff on click**: expands a unified diff rendered through the stock `DiffBlock` primitive (16-line capped collapse, copy, `└ +A -R` footer, theme tokens)
- **Per-turn summary card (R2)**: a collapsible "N files changed +X −Y" bar at each turn's tail; expands to per-file rows (name · directory · ±lines · review · open ▾ · ∨). Same-file edits within a turn merge and accumulate
- **PTC / Code Dispatch fallback**: nested sub-calls carry no wire diff views; the plugin derives the call-time diff from the tools' own `presentCall` semantics (edit's old→new, write's whole-file create). `rootCallId+subCallId` dedup keeps replays from double-counting
- **Undo (M4)**: reverts the turn's files to their pre-turn state — reverse uniqueness-checked hunk peeling, deletes files the turn created, rejects drifted files before writing, atomic commits
- **Inline view (M4)**: 打开 ▾ → View inline expands a height-capped file content window (16-line collapse, the stock DiffBlock interaction)
- **Open with (M4)**: system open (the stock `openFile`), reveal in Explorer, open in VS Code, copy absolute/relative path
- **zh / en**: copy follows the Web UI language (locale service)

## How it works

- **R1**: registers the `edit`/`write` keys of the `tool.call.toolview` keyed slot at priority −1 (shadows the shipped rows); diff data follows the authoritative chain resultView → callView → argument fallback (a truncated window that dropped the call head still renders from the result view)
- **R2**: a `ConversationNodeDefinition` accumulator (`turn/start` / `tool/call` / `tool/result(append)` / `tool/code-dispatch`) publishes Turn data; the `conversation.chat.turnTail` chain claims rendering — modeled on the official `ui-deliverables` plugin
- **Host half (optional)**: a same-origin prefix route serves a fenced API — realpath containment (checked before and after resolution), symlink rejection, UTF-8 round-trip validation, 512 KiB read cap, atomic writes. When the host half is absent the dependent actions hide themselves

## Install

```sh
# npm pack tarball (recommended; sidesteps the Windows local-dir link: junction bug)
dsh plugin --profile web add dsh-external-dsh-diff-stat-<version>.tgz

# restart dsh web to take effect
dsh web
```

Uninstall:

```sh
dsh plugin --profile web remove @dsh-external/dsh-diff-stat
```

## Development

```sh
npm install --legacy-peer-deps          # devDependencies (peers are dsh-internal packages)
DSH_CHECKOUT=<dsh checkout> bash scripts/build.sh   # host half → lib/ (junction links + tsc)
npm run build:client                    # browser half → lib/client.js (tsdown)
npm run typecheck                       # both halves via tsc
```

Milestones: M0 skeleton → M1 inline badges → M2 PTC fallback → M3 turn card → M4 undo/inline view/open-with → M5 polish (all landed in this repository).

## License

BSD-3-Clause
