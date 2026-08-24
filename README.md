# dsh-diff-stat

Inline **+N −M** diff badges on `edit`/`write` tool rows and a per-turn file
change summary card for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).
Full unified diffs on click. Works for Code Dispatch (PTC) nested sub-calls via
argument fallback — no wire diff view required. No git dependency, no
third-party plugin dependencies.

## Milestones

| M | Content |
|---|---------|
| M0 | Skeleton: dual-half package, build & injection pipeline |
| M1 | R1 inline badges + expanded diff (native calls) |
| M2 | PTC/code-dispatch fallback (argument-derived diffs) |
| M3 | R2 per-turn summary card (turnTail chain) |
| M4 | Undo + inline bounded file view + open-with (host half) |
| M5 | Polish: large-diff performance, themes, i18n, README |

## Build

```bash
DSH_CHECKOUT=<dsh checkout> bash scripts/build.sh   # host half → lib/
npm run build:client                                # browser bundle → lib/client.js
npm run typecheck
```

## Install

```bash
dsh plugin --profile web add <this directory>
```
