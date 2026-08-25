/** `diff-stat` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'diff-stat'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'card.filesChanged': '{count} 个文件已更改',
  'card.undo': '撤销',
  'card.undoing': '撤销中…',
  'card.undone': '已撤销',
  'card.undoFailed': '撤销失败',
  'card.undoFailedTitle': '撤销失败：文件可能已在此轮之外被改动',
  'card.undoTitle': '把这一轮改动的文件恢复到轮前状态',
  'card.review': '审查',
  'card.open': '打开',
  'card.openMore': '更多打开方式',
  'card.openSystem': '系统打开',
  'card.peek': '内嵌查看',
  'card.showInExplorer': '资源管理器中显示',
  'card.openInVscode': '在 VS Code 中打开',
  'card.copyAbs': '复制绝对路径',
  'card.copyRel': '复制相对路径',
  'peek.loading': '读取中…',
  'peek.hostUnavailable': 'host API 不可用',
  'peek.readFailed': '读取失败',
  'peek.binary': '二进制文件（{size} 字节），无法预览',
  'peek.bytes': '{size} 字节',
  'peek.truncated': '已截断（前 512 KiB）',
  'peek.close': '关闭',
}

/** English dictionary (same key set). */
export const en: Record<DiffStatKey, string> = {
  'card.filesChanged': '{count} files changed',
  'card.undo': 'Undo',
  'card.undoing': 'Undoing…',
  'card.undone': 'Undone',
  'card.undoFailed': 'Undo failed',
  'card.undoFailedTitle': "Undo failed: files may have changed outside this turn",
  'card.undoTitle': "Revert this turn's file changes to their pre-turn state",
  'card.review': 'Review',
  'card.open': 'Open',
  'card.openMore': 'More ways to open',
  'card.openSystem': 'Open with system',
  'card.peek': 'View inline',
  'card.showInExplorer': 'Show in Explorer',
  'card.openInVscode': 'Open in VS Code',
  'card.copyAbs': 'Copy absolute path',
  'card.copyRel': 'Copy relative path',
  'peek.loading': 'Loading…',
  'peek.hostUnavailable': 'host API unavailable',
  'peek.readFailed': 'Read failed',
  'peek.binary': 'Binary file ({size} bytes); no preview',
  'peek.bytes': '{size} bytes',
  'peek.truncated': 'truncated (first 512 KiB)',
  'peek.close': 'Close',
}

/** Union of this namespace's dictionary keys. */
export type DiffStatKey = keyof typeof zh