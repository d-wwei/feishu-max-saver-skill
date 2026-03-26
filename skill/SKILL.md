---
name: feishu-max-saver
description: >
  飞书全平台 AI Skill — 用 4% 上下文成本覆盖 90% 飞书操作。
  读写文档、发消息、多维表格、日历、审批、OKR、通讯录等 26 大类能力。
  通过 feishu CLI 直连飞书 REST API，任何能执行 shell 的 Agent 均可使用。
  Use when: (1) 用户要搜索/读取/创建/删除飞书文档,
  (2) 用户要操作文档 block（列出、更新、创建、删除）,
  (3) 用户要管理飞书文件夹,
  (4) 用户要查看/搜索 wiki 或做 wiki URL 转换,
  (5) 用户要往已有文档写入内容,
  (6) 用户提到"飞书"、"lark"、"feishu"相关操作,
  (7) 用户要发送/回复/读取飞书 IM 消息,
  (8) 用户要操作多维表格（查记录、写记录、搜索）,
  (9) 用户要查看/创建/删除日历事件,
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

命令行操作飞书，所有命令输出 JSON。首次使用看 `references/setup.md`。

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

### IM 消息

```
feishu im send <chatId> --content <文本>                # 发消息，默认 text 类型
feishu im send <openId> --content <文本> --receive-type open_id  # 发给个人
feishu im reply <messageId> --content <文本>            # 回复消息
feishu im list <chatId>                                  # 列出消息，可加 --count <n>
feishu im get <messageId>                                # 读取单条消息
feishu im forward <messageId> --receive-id <chatId>     # 转发消息，可加 --receive-type
feishu im delete <messageId>                             # 撤回消息
feishu im send-image <receiveId> --image-key <key>      # 发送图片（需先上传获取 image_key）
feishu im send-file <receiveId> --file-key <key>        # 发送文件（需先上传获取 file_key）
feishu im read-status <messageId>                        # 查看消息已读状态
```

### 多维表格 (Bitable)

```
feishu bitable list-tables <appToken>                    # 列出表
feishu bitable list-records <appToken> <tableId>         # 列出记录，可加 --filter
feishu bitable get-record <appToken> <tableId> <recordId>
feishu bitable create-record <appToken> <tableId> --fields '<json>'
feishu bitable update-record <appToken> <tableId> <recordId> --fields '<json>'
feishu bitable delete-record <appToken> <tableId> <recordId>
feishu bitable search-records <appToken> <tableId>       # 可加 --filter --sort --fields
```

### 日历

```
feishu calendar list                                     # 列出日历
feishu calendar list-events <calendarId>                 # 可加 --start --end
feishu calendar get-event <calendarId> <eventId>
feishu calendar create-event <calendarId> --summary <标题> --start <RFC3339> --end <RFC3339>
feishu calendar delete-event <calendarId> <eventId>
```

### 群聊 (Chat)

```
feishu chat list                                        # 列出机器人所在的群
feishu chat info <chatId>                               # 群详情
feishu chat create --name <群名>                        # 创建群，可加 --description
feishu chat members <chatId>                            # 列出群成员
feishu chat add-members <chatId> --id-list <id1> <id2>  # 添加群成员，可加 --member-type
feishu chat remove-members <chatId> --id-list <id1>     # 移除群成员
feishu chat get-announcement <chatId>                   # 获取群公告
feishu chat set-announcement <chatId> --content <文本>  # 设置群公告，可加 --revision
```

### 通讯录 (Contact)

```
feishu contact get-user <userId>                        # 查用户，可加 --id-type
feishu contact search-user <关键词>                     # 搜索用户
feishu contact get-dept <deptId>                        # 查部门
feishu contact list-dept                                # 列出子部门，可加 --parent-id
```

### 任务 (Task)

```
feishu task list                                        # 列出任务
feishu task get <taskId>                                # 任务详情
feishu task create --summary <摘要>                     # 创建任务，可加 --due --description
feishu task complete <taskId>                           # 完成任务
feishu task delete <taskId>                             # 删除任务
```

### 审批 (Approval)

```
feishu approval list <approvalCode>                     # 列出审批实例
feishu approval get <instanceId>                        # 审批详情
feishu approval create <approvalCode> --form '<json>'   # 发起审批
```

### 电子表格 (Sheets)

```
feishu sheets info <spreadsheetToken>                   # 表格元信息
feishu sheets list-sheets <spreadsheetToken>            # 列出 sheet 页
feishu sheets read <spreadsheetToken> <range>           # 读取单元格，如 Sheet1!A1:C5
feishu sheets write <spreadsheetToken> --range <range> --values '<json 2D array>'
feishu sheets append <spreadsheetToken> --range <range> --values '<json 2D array>'
```

### 评论 (Comment)

```
feishu comment list <fileToken>                         # 列出文档评论，可加 --file-type
feishu comment get <fileToken> <commentId>              # 查看评论详情
feishu comment create <fileToken> --content <文本>      # 添加评论
```

### 搜索 (Search)

```
feishu search message <query>                           # 搜索消息
feishu search app <query>                               # 搜索应用
```

### 妙记 (Minutes)

```
feishu minutes get <minuteToken>                       # 获取妙记详情（转写内容）
feishu minutes statistics <minuteToken>                # 获取妙记统计（浏览/分享）
```

### 视频会议 (VC)

```
feishu vc reserve --topic <主题>                       # 预约会议，可加 --start --end
feishu vc get-reserve <reserveId>                      # 查看预约详情
feishu vc cancel-reserve <reserveId>                   # 取消预约
feishu vc get-meeting <meetingId>                      # 查看会议详情
feishu vc list-by-no <meetingNo>                       # 按会议号查会议
```

### 文档权限 (Permission)

```
feishu permission list <token>                         # 列出协作者，可加 --type
feishu permission add <token> --member-type <type> --member-id <id> --perm <perm>
feishu permission update <token> <memberId> --member-type <type> --perm <perm>
feishu permission remove <token> <memberId> --member-type <type>
```

### 邮箱 (Mail)

```
feishu mail list-groups                                # 列出邮件组
feishu mail get-group <mailgroupId>                    # 邮件组详情
feishu mail list-group-members <mailgroupId>           # 邮件组成员
feishu mail list-public-mailboxes                      # 列出公共邮箱
```

### 企业百科 (Lingo)

```
feishu lingo search <关键词>                           # 搜索词条
feishu lingo get <entityId>                            # 词条详情
feishu lingo list                                      # 列出所有词条
feishu lingo create --main-key <词条名>                # 创建词条，可加 --description --aliases
```

### OKR

```
feishu okr list <userId>                               # 列出用户 OKR，可加 --lang
feishu okr get <okrId>                                 # OKR 详情
feishu okr periods                                     # 列出 OKR 周期
```

### 汇报 (Report)

```
feishu report list-rules                               # 列出汇报规则
feishu report list-tasks --rule-id <id>                # 列出汇报任务
```

### 租户 (Tenant)

```
feishu tenant info                                     # 查看当前租户信息
```

### 考勤 (Attendance)

```
feishu attendance query-tasks --user-ids <ids...> --check-date-from <YYYYMMDD> --check-date-to <YYYYMMDD>
feishu attendance query-stats --user-ids <ids...> --start-date <YYYYMMDD> --end-date <YYYYMMDD>
feishu attendance list-shifts                          # 列出班次
feishu attendance get-shift <shiftId>                  # 班次详情
```

### 管理后台 (Admin)

```
feishu admin audit-logs                                # 审计日志，可加 --latest <天数>
feishu admin department-stats --department-id <id> --start-date <YYYYMMDD> --end-date <YYYYMMDD>
feishu admin user-stats --department-id <id> --start-date <YYYYMMDD> --end-date <YYYYMMDD>
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
- block body / bitable fields 的 JSON 格式参考飞书开放平台文档
- IM 发消息默认 `--receive-type chat_id`，发给个人用 `--receive-type open_id`
- 日历时间用 RFC3339 格式，如 `2026-03-27T09:00:00+08:00`
- Sheets values 用 JSON 二维数组，如 `[["a","b"],["c","d"]]`
- 审批 form 是 JSON 字符串，格式参考飞书审批定义
