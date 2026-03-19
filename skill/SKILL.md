---
name: feishu
description: >
  读写飞书文档、搜索、管理 block 和文件夹。通过 feishu-cli 直连飞书 REST API。
  Use when: (1) 用户要搜索/读取/创建/删除飞书文档,
  (2) 用户要操作文档 block（列出、更新、创建、删除）,
  (3) 用户要管理飞书文件夹,
  (4) 用户要查看/搜索 wiki 或做 wiki URL 转换,
  (5) 用户要往已有文档写入内容,
  (6) 用户提到"飞书"、"lark"、"feishu"相关操作。
  Triggers: "飞书", "lark", "feishu", "搜文档", "写文档", "创建文档",
  "读文档", "查飞书", "飞书搜索", "文档block", "飞书文件夹",
  "搜wiki", "wiki搜索", "wiki转换", "写入文档".
---

# Feishu CLI

命令行操作飞书文档，所有命令输出 JSON。首次使用看 `references/setup.md`。

## 命令速查

### 文档

```
feishu doc search <关键词>              # 可加 --count <n> --type <types...>
feishu doc read <docId>                 # 纯文本
feishu doc info <docId>                 # 元信息
feishu doc create --title <标题>        # 可加 --folder <token>
feishu doc delete <docId>               # 加 -y 跳过确认
feishu doc write <docId> --content <md>  # 写入 markdown，可加 --index <n>
```

### Block

```
feishu block list <docId>
feishu block update <docId> <blockId> --body '<json>'
feishu block create <docId> <parentBlockId> --body '<json>'
feishu block delete <docId> <parentBlockId> --start <n> --end <n>
```

### 文件夹

```
feishu folder list <folderToken>
feishu folder create --parent <token> --name <名称>
```

### Wiki

```
feishu wiki get <token>
feishu wiki search <关键词>              # 可加 --count <n>
feishu wiki convert <url|token>          # Wiki URL/token → 文档 ID
```

### 通用

```
feishu tool list                        # 列出所有可用 API 工具
feishu tool call <工具名> '<json>'      # 直接调用任意工具
```

## 输出格式

成功: `{"data": {...}}` → stdout | 失败: `{"error": "...", "code": "..."}` → stderr

## 注意

- 删除不可恢复，`doc delete` 默认要求确认，脚本场景加 `-y`
- block body JSON 格式参考飞书开放平台文档
