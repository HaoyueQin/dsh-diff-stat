# DSH Diff Stat

[English](README.md) | [中文](README.zh.md)

[![dsh plugin](https://img.shields.io/badge/dsh-plugin-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
[![npm](https://img.shields.io/npm/v/dsh-diff-stat?style=flat-square)](https://www.npmjs.com/package/dsh-diff-stat)
[![dsh](https://img.shields.io/badge/dsh-%E2%89%A50.1.1--rc-4D6BFE?style=flat-square)](https://github.com/deepseek-ai/deepseek-harness)
![platform](https://img.shields.io/badge/platform-web-8A9CF5?style=flat-square)
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-blue?style=flat-square)](LICENSE)
![i18n](https://img.shields.io/badge/i18n-zh%20%7C%20en-success?style=flat-square)

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 插件：为 `edit`/`write` 工具行提供行内 **+N −M** 徽标，并在每轮结束时给出文件变更汇总卡。点击展开完整 unified diff；Code Dispatch（PTC）嵌套子调用照常工作（参数兜底推导，不依赖 wire diff 视图）。不依赖 git，不依赖任何第三方插件。

## 功能

- **行内 +N −M 徽标（R1）**：接管 stock 的 edit/write 工具行（keyed 低优先阴影，卸载自动还原 stock），收起态即见增删行数——运行中用参数推导预估，结算后以 resultView 精确值替换
- **展开完整 diff**：点击行展开 unified diff，渲染走 stock `DiffBlock` 原语（16 行限高折叠、复制、`└ +A -R` 页脚、主题令牌）
- **轮末汇总卡（R2）**：每轮消息流尾部折叠条「N 个文件已更改 +X −Y」；展开逐文件行（文件名 · 目录 · ±行数 · 审查 · 打开 ▾ · ∨），同文件多次编辑合并累计
- **PTC/Code Dispatch 兜底**：嵌套子调用在 wire 上没有任何 diff 视图，插件按工具自身 `presentCall` 语义从参数推导调用时 diff（edit 的 old→new、write 的整文件新增）；`rootCallId+subCallId` 去重防重放双计
- **撤销（M4）**：一键把本轮改动恢复到轮前状态——hunk 链倒序唯一性回剥、本轮新建文件删除、文件漂移拒绝写入、原子写
- **内嵌查看（M4）**：「打开 ▾ → 内嵌查看」在条目下方展开限高文件内容窗口（16 行折叠，与 stock DiffBlock 同款交互）
- **打开系（M4）**：系统打开（本体 `openFile`）+ 资源管理器定位 + VS Code 打开 + 复制绝对/相对路径
- **中英文**：跟随 Web 界面语言（locale 服务）

## 机制

- **R1**：注册进 `tool.call.toolview` keyed 槽的 `edit`/`write` 键，priority −1 阴影 shipped 行；diff 数据按「resultView → callView → 参数兜底」三级提取（顺序即合同：窗口截断丢 callView 时仍可从 resultView 渲染）
- **R2**：`ConversationNodeDefinition` 聚合器（`turn/start` / `tool/call` / `tool/result(append)` / `tool/code-dispatch`）发布 Turn 数据，`conversation.chat.turnTail` 链认领渲染；结构遵循官方 `ui-deliverables` 模式
- **host 半**（可选）：同源前缀路由提供围栏 API——realpath 包含性（解析前后双查）、符号链接拒绝、UTF-8 回环校验、512 KiB 读取截断、原子写；host 半缺席时相关按钮自动隐藏

## 安装

```sh
# npm pack 产物（推荐，绕开 Windows 本地目录 link: junction bug）
dsh plugin --profile web add dsh-diff-stat-<version>.tgz

# 重启 dsh web 生效
dsh web
```

卸载：

```sh
dsh plugin --profile web remove dsh-diff-stat
```

## 开发

```sh
npm install --legacy-peer-deps          # devDependencies（peer 均为 dsh 内部包）
DSH_CHECKOUT=<dsh checkout> bash scripts/build.sh   # host 半 → lib/（junction 链接 + tsc）
npm run build:client                    # 浏览器半 → lib/client.js（tsdown）
npm run typecheck                       # 双端 tsc
```

里程碑：M0 脚手架 → M1 行内徽标 → M2 PTC 兜底 → M3 轮末卡 → M4 撤销/内嵌查看/打开系 → M5 打磨（本仓库已全部落地）。

## License

BSD-3-Clause
