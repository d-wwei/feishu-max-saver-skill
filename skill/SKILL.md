---
name: feishu-max-saver
description: >
  飞书全平台 AI Skill — 134 个 API，29 类能力，双身份模式（--as user/bot）。
  覆盖：文档读写搜索、Block、文件夹、Wiki、IM消息（发/回/转/撤/表情/置顶/合并转发/加急）、
  多维表格（CRUD/批量/字段/视图）、日历（事件/参会者/空闲忙碌/RSVP）、群聊管理、
  通讯录、任务、审批、电子表格、评论、搜索、妙记、视频会议、文档权限、邮箱、
  企业百科、OKR、汇报、租户、考勤、管理后台。
  通过 feishu CLI 直连 REST API，任何能执行 shell 的 Agent 均可使用。
  Triggers: "飞书", "lark", "feishu", "文档", "消息", "IM", "多维表格",
  "bitable", "日历", "calendar", "群聊", "通讯录", "任务", "审批",
  "表格", "sheets", "评论", "搜索", "妙记", "视频会议", "权限",
  "邮件", "百科", "OKR", "汇报", "考勤", "审计", "admin".
---

# Feishu CLI

命令行操作飞书，输出 JSON。setup 见 `references/setup.md`，全部命令见 `references/commands.md`。

## IM 规则

飞书 IM 桥接对话中**直接回复**，不要用 `feishu im send`。`im send` 仅用于主动通知第三方。

## 常用速查

```
feishu doc search/read/create/write/delete/upload-image/upload-file <args>
feishu im send/reply/forward/delete/pin/urgent <args>
feishu bitable search-records/create-record/batch-create <args>
feishu calendar list-events/create-event/freebusy <args>
feishu chat list/info/create/members/search <args>
feishu task list/create/complete <args>
feishu sheets read/write/append <args>
feishu tool call <工具名> '<json>'    # 调用任意 API
```

## 格式

成功 `{"data":{...}}` stdout | 失败 `{"error":"...","code":"..."}` stderr

## 备注

- `--as user` 用户身份（需 user_access_token），默认 bot
- Workflow 模板见 `references/workflows.md`（会议纪要/站会日报/图表插入文档）
- 完整参数见 `references/commands.md`
