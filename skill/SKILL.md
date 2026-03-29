---
name: feishu-max-saver
description: >
  飞书全平台 AI Skill — 低上下文成本覆盖 90% 飞书操作。
  125 个 API 端点，29 大类能力，双身份模式（--as user/bot）。
  通过 feishu CLI 直连飞书 REST API，任何能执行 shell 的 Agent 均可使用。
  完整命令速查见 references/commands.md。
  Use when: (1) 用户要搜索/读取/创建/删除飞书文档,
  (2) 用户要操作文档 block（列出、更新、创建、删除）,
  (3) 用户要管理飞书文件夹,
  (4) 用户要查看/搜索 wiki 或做 wiki URL 转换,
  (5) 用户要往已有文档写入内容,
  (6) 用户提到"飞书"、"lark"、"feishu"相关操作,
  (7) 用户要发送/回复/读取飞书 IM 消息,
  (8) 用户要操作多维表格（查记录、写记录、搜索、批量操作、字段管理）,
  (9) 用户要查看/创建/删除日历事件、查空闲忙碌、管理参会者,
  (10) 用户要管理群聊（列群、群信息、建群、群成员）,
  (11) 用户要查通讯录（查人、查部门）,
  (12) 用户要管理任务（列任务、创建、完成、删除）,
  (13) 用户要查审批（审批列表、详情、发起）,
  (14) 用户要操作电子表格（读写单元格、追加数据）,
  (15) 用户要评论文档,
  (16) 用户要搜索消息或应用,
  (17) 用户要查看妙记（会议录音转写）,
  (18) 用户要预约/查看视频会议,
  (19) 用户要管理文档权限（共享/协作者）,
  (20) 用户要查邮件组/公共邮箱,
  (21) 用户要查企业百科/词典,
  (22) 用户要查看 OKR,
  (23) 用户要查汇报规则/任务,
  (24) 用户要查租户信息,
  (25) 用户要查考勤记录/班次,
  (26) 用户要查审计日志/使用统计。
  Triggers: "飞书", "lark", "feishu", "搜文档", "写文档", "创建文档",
  "读文档", "查飞书", "飞书搜索", "文档block", "飞书文件夹",
  "搜wiki", "wiki搜索", "wiki转换", "写入文档",
  "发消息", "飞书消息", "IM", "群消息", "回复消息",
  "多维表格", "bitable", "表格记录", "查记录", "写记录",
  "日历", "日程", "会议", "calendar", "创建事件",
  "群聊", "建群", "群成员", "通讯录", "查人", "部门",
  "任务", "task", "待办", "审批", "approval",
  "电子表格", "sheets", "spreadsheet", "单元格",
  "评论", "comment", "搜消息", "搜应用",
  "妙记", "minutes", "转写", "录音",
  "视频会议", "预约会议", "vc", "reserve",
  "文档权限", "共享", "协作者", "permission",
  "邮件", "邮件组", "mail", "公共邮箱",
  "百科", "词典", "lingo", "glossary",
  "OKR", "目标", "关键结果",
  "汇报", "report", "周报",
  "租户", "tenant",
  "考勤", "打卡", "班次", "attendance",
  "审计", "统计", "admin".
---

# Feishu CLI

命令行操作飞书，所有命令输出 JSON。首次使用看 `references/setup.md`，完整命令速查看 `references/commands.md`。

## 重要规则：消息回复 vs 主动发送

当用户通过飞书消息（IM 桥接通道）与你对话时，**直接在当前对话中回复即可，不要使用 `feishu im send`**。

`feishu im send` 仅用于：主动通知某人、给第三方群/用户发消息、定时提醒等非对话场景。

## 能力概览（29 类，每类最常用命令）

| 类别 | 常用命令示例 |
|---|---|
| 文档 | `feishu doc search <关键词>`, `feishu doc read <id>`, `feishu doc write <id> --content <md>` |
| Block | `feishu block list <docId>`, `feishu block update <docId> <blockId> --body '<json>'` |
| 文件夹 | `feishu folder list <token>`, `feishu folder create --parent <token> --name <名>` |
| Wiki | `feishu wiki search <关键词>`, `feishu wiki convert <url>` |
| IM 消息 | `feishu im send <chatId> --content <文本>`, `feishu im reply <msgId> --content <文本>` |
| IM 高级 | `feishu im add-reaction`, `feishu im pin`, `feishu im merge-forward`, `feishu im urgent` |
| 多维表格 | `feishu bitable search-records <app> <table>`, `feishu bitable create-record ... --fields '<json>'` |
| 表格高级 | `feishu bitable batch-create`, `feishu bitable list-fields`, `feishu bitable list-views` |
| 日历 | `feishu calendar list-events <calId>`, `feishu calendar create-event <calId> --summary <标题>` |
| 日历高级 | `feishu calendar freebusy`, `feishu calendar list-attendees`, `feishu calendar rsvp` |
| 群聊 | `feishu chat list`, `feishu chat info <id>`, `feishu chat create --name <群名>` |
| 通讯录 | `feishu contact search-user <关键词>`, `feishu contact get-user <id>` |
| 任务 | `feishu task list`, `feishu task create --summary <摘要>` |
| 审批 | `feishu approval list <code>`, `feishu approval create <code> --form '<json>'` |
| 电子表格 | `feishu sheets read <token> <range>`, `feishu sheets write <token> --range <r> --values '<json>'` |
| 评论 | `feishu comment list <fileToken>`, `feishu comment create <fileToken> --content <文本>` |
| 搜索 | `feishu search message <query>`, `feishu search app <query>` |
| 妙记 | `feishu minutes get <token>` |
| 视频会议 | `feishu vc reserve --topic <主题>`, `feishu vc get-meeting <id>` |
| 权限 | `feishu permission list <token>`, `feishu permission add <token> --member-id <id> --perm <perm>` |
| 邮箱 | `feishu mail list-groups`, `feishu mail list-group-members <id>` |
| 百科 | `feishu lingo search <关键词>`, `feishu lingo create --main-key <词条名>` |
| OKR | `feishu okr list <userId>`, `feishu okr get <okrId>` |
| 汇报 | `feishu report list-rules`, `feishu report list-tasks --rule-id <id>` |
| 租户 | `feishu tenant info` |
| 考勤 | `feishu attendance query-tasks --user-ids <ids> --check-date-from/to <YYYYMMDD>` |
| 管理后台 | `feishu admin audit-logs`, `feishu admin department-stats --department-id <id>` |
| 通用 | `feishu tool list`, `feishu tool call <工具名> '<json>'` |

## 输出格式

成功: `{"data": {...}}` → stdout | 失败: `{"error": "...", "code": "..."}` → stderr

## Workflow 模板

详见 `references/workflows.md`：会议纪要汇总、站会日报。

## 注意

- `--as user` 以用户身份操作（需配置 user_access_token），默认 bot
- 完整参数和全部命令见 `references/commands.md`
- 日历时间用 RFC3339，Sheets values 用 JSON 二维数组，审批 form 参考飞书文档
