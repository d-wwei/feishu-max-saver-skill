# Feishu CLI — 完整命令速查

Agent 按需加载此文件获取具体命令参数。

## 文档

```
feishu doc search <关键词>              # 可加 --count <n> --type <types...>
feishu doc read <docId>                 # 纯文本
feishu doc info <docId>                 # 元信息
feishu doc create --title <标题>        # 可加 --folder <token>
feishu doc delete <docId>               # 加 -y 跳过确认
feishu doc write <docId> --content <md>  # 写入 markdown，可加 --index <n>
```

## Block

```
feishu block list <docId>
feishu block update <docId> <blockId> --body '<json>'
feishu block create <docId> <parentBlockId> --body '<json>'
feishu block delete <docId> <parentBlockId> --start <n> --end <n>
```

## 文件夹

```
feishu folder list <folderToken>
feishu folder create --parent <token> --name <名称>
```

## Wiki

```
feishu wiki get <token>
feishu wiki search <关键词>              # 可加 --count <n>
feishu wiki convert <url|token>          # Wiki URL/token → 文档 ID
```

## IM 消息

```
feishu im send <chatId> --content <文本>                # 发消息，默认 text 类型
feishu im send <openId> --content <文本> --receive-type open_id  # 发给个人
feishu im reply <messageId> --content <文本>            # 回复消息
feishu im list <chatId>                                  # 列出消息，可加 --count <n>
feishu im get <messageId>                                # 读取单条消息
feishu im forward <messageId> --receive-id <chatId>     # 转发消息，可加 --receive-type
feishu im delete <messageId>                             # 撤回消息
feishu im send-image <receiveId> --image-key <key>      # 发送图片
feishu im send-file <receiveId> --file-key <key>        # 发送文件
feishu im read-status <messageId>                        # 查看消息已读状态
feishu im add-reaction <messageId> --emoji <type>        # 添加表情回应 (THUMBSUP, SMILE 等)
feishu im remove-reaction <messageId> <reactionId>       # 移除表情回应
feishu im list-reactions <messageId>                      # 列出表情回应
feishu im pin <messageId>                                 # 置顶消息
feishu im unpin <messageId>                               # 取消置顶
feishu im list-pins <chatId>                              # 列出置顶消息
feishu im merge-forward --message-ids <id1> <id2> --receive-id <chatId>  # 合并转发
feishu im urgent <messageId> --type <app|sms|phone> --user-ids <id1>     # 加急消息
```

## 多维表格 (Bitable)

```
feishu bitable list-tables <appToken>                    # 列出表
feishu bitable list-records <appToken> <tableId>         # 列出记录，可加 --filter
feishu bitable get-record <appToken> <tableId> <recordId>
feishu bitable create-record <appToken> <tableId> --fields '<json>'
feishu bitable update-record <appToken> <tableId> <recordId> --fields '<json>'
feishu bitable delete-record <appToken> <tableId> <recordId>
feishu bitable search-records <appToken> <tableId>       # 可加 --filter --sort --fields
feishu bitable batch-create <appToken> <tableId> --records '<json array>'  # 批量创建 (≤1000)
feishu bitable batch-update <appToken> <tableId> --records '<json array>'  # 批量更新 (≤1000)
feishu bitable batch-delete <appToken> <tableId> --record-ids <id1> <id2>  # 批量删除 (≤500)
feishu bitable batch-get <appToken> <tableId> --record-ids <id1> <id2>     # 批量查询 (≤100)
feishu bitable list-fields <appToken> <tableId>          # 列出字段（列），可加 --view-id
feishu bitable create-field <appToken> <tableId> --name <名> --type <n>    # 创建字段
feishu bitable update-field <appToken> <tableId> <fieldId> --name <新名>   # 更新字段
feishu bitable delete-field <appToken> <tableId> <fieldId>                 # 删除字段
feishu bitable list-views <appToken> <tableId>           # 列出视图
feishu bitable create-view <appToken> <tableId> --name <名> --type <grid|kanban|...>
feishu bitable get-view <appToken> <tableId> <viewId>    # 视图详情
```

## 日历

```
feishu calendar list                                     # 列出日历
feishu calendar list-events <calendarId>                 # 可加 --start --end
feishu calendar get-event <calendarId> <eventId>
feishu calendar create-event <calendarId> --summary <标题> --start <RFC3339> --end <RFC3339>
feishu calendar delete-event <calendarId> <eventId>
feishu calendar search-events <calendarId> --query <关键词>               # 搜索事件
feishu calendar rsvp <calendarId> <eventId> --status <accept|decline|tentative>  # 回复日程
feishu calendar list-instances <calendarId> <eventId>                     # 列出重复事件实例
feishu calendar list-attendees <calendarId> <eventId>                     # 列出参会者
feishu calendar add-attendees <calendarId> <eventId> --attendees '<json>' # 添加参会者
feishu calendar remove-attendees <calendarId> <eventId> --attendee-ids <id1>  # 移除参会者
feishu calendar freebusy --start <RFC3339> --end <RFC3339> --user-id <id> # 查空闲忙碌
```

## 群聊 (Chat)

```
feishu chat list                                        # 列出机器人所在的群
feishu chat info <chatId>                               # 群详情
feishu chat create --name <群名>                        # 创建群，可加 --description
feishu chat members <chatId>                            # 列出群成员
feishu chat add-members <chatId> --id-list <id1> <id2>  # 添加群成员，可加 --member-type
feishu chat remove-members <chatId> --id-list <id1>     # 移除群成员
feishu chat get-announcement <chatId>                   # 获取群公告
feishu chat set-announcement <chatId> --content <文本>  # 设置群公告，可加 --revision
feishu chat update <chatId> --name <新群名>             # 更新群属性，可加 --description --icon
feishu chat link <chatId>                               # 获取群分享链接
feishu chat search <关键词>                             # 搜索群聊，可加 --page-size
```

## 通讯录 (Contact)

```
feishu contact get-user <userId>                        # 查用户，可加 --id-type
feishu contact search-user <关键词>                     # 搜索用户
feishu contact get-dept <deptId>                        # 查部门
feishu contact list-dept                                # 列出子部门，可加 --parent-id
```

## 任务 (Task)

```
feishu task list                                        # 列出任务
feishu task get <taskId>                                # 任务详情
feishu task create --summary <摘要>                     # 创建任务，可加 --due --description
feishu task complete <taskId>                           # 完成任务
feishu task delete <taskId>                             # 删除任务
```

## 审批 (Approval)

```
feishu approval list <approvalCode>                     # 列出审批实例
feishu approval get <instanceId>                        # 审批详情
feishu approval create <approvalCode> --form '<json>'   # 发起审批
```

## 电子表格 (Sheets)

```
feishu sheets info <spreadsheetToken>                   # 表格元信息
feishu sheets list-sheets <spreadsheetToken>            # 列出 sheet 页
feishu sheets read <spreadsheetToken> <range>           # 读取单元格，如 Sheet1!A1:C5
feishu sheets write <spreadsheetToken> --range <range> --values '<json 2D array>'
feishu sheets append <spreadsheetToken> --range <range> --values '<json 2D array>'
```

## 评论 (Comment)

```
feishu comment list <fileToken>                         # 列出文档评论，可加 --file-type
feishu comment get <fileToken> <commentId>              # 查看评论详情
feishu comment create <fileToken> --content <文本>      # 添加评论
```

## 搜索 (Search)

```
feishu search message <query>                           # 搜索消息
feishu search app <query>                               # 搜索应用
```

## 妙记 (Minutes)

```
feishu minutes get <minuteToken>                       # 获取妙记详情（转写内容）
feishu minutes statistics <minuteToken>                # 获取妙记统计（浏览/分享）
```

## 视频会议 (VC)

```
feishu vc reserve --topic <主题>                       # 预约会议，可加 --start --end
feishu vc get-reserve <reserveId>                      # 查看预约详情
feishu vc cancel-reserve <reserveId>                   # 取消预约
feishu vc get-meeting <meetingId>                      # 查看会议详情
feishu vc list-by-no <meetingNo>                       # 按会议号查会议
```

## 文档权限 (Permission)

```
feishu permission list <token>                         # 列出协作者，可加 --type
feishu permission add <token> --member-type <type> --member-id <id> --perm <perm>
feishu permission update <token> <memberId> --member-type <type> --perm <perm>
feishu permission remove <token> <memberId> --member-type <type>
```

## 邮箱 (Mail)

```
feishu mail list-groups                                # 列出邮件组
feishu mail get-group <mailgroupId>                    # 邮件组详情
feishu mail list-group-members <mailgroupId>           # 邮件组成员
feishu mail list-public-mailboxes                      # 列出公共邮箱
```

## 企业百科 (Lingo)

```
feishu lingo search <关键词>                           # 搜索词条
feishu lingo get <entityId>                            # 词条详情
feishu lingo list                                      # 列出所有词条
feishu lingo create --main-key <词条名>                # 创建词条，可加 --description --aliases
```

## OKR

```
feishu okr list <userId>                               # 列出用户 OKR，可加 --lang
feishu okr get <okrId>                                 # OKR 详情
feishu okr periods                                     # 列出 OKR 周期
```

## 汇报 (Report)

```
feishu report list-rules                               # 列出汇报规则
feishu report list-tasks --rule-id <id>                # 列出汇报任务
```

## 租户 (Tenant)

```
feishu tenant info                                     # 查看当前租户信息
```

## 考勤 (Attendance)

```
feishu attendance query-tasks --user-ids <ids...> --check-date-from <YYYYMMDD> --check-date-to <YYYYMMDD>
feishu attendance query-stats --user-ids <ids...> --start-date <YYYYMMDD> --end-date <YYYYMMDD>
feishu attendance list-shifts                          # 列出班次
feishu attendance get-shift <shiftId>                  # 班次详情
```

## 管理后台 (Admin)

```
feishu admin audit-logs                                # 审计日志，可加 --latest <天数>
feishu admin department-stats --department-id <id> --start-date <YYYYMMDD> --end-date <YYYYMMDD>
feishu admin user-stats --department-id <id> --start-date <YYYYMMDD> --end-date <YYYYMMDD>
```

## 通用

```
feishu tool list                        # 列出所有可用 API 工具
feishu tool call <工具名> '<json>'      # 直接调用任意工具
```

## 参数格式备忘

- 日历时间: RFC3339, 如 `2026-03-27T09:00:00+08:00`
- Sheets values: JSON 二维数组, 如 `[["a","b"],["c","d"]]`
- Bitable fields: JSON 对象, 如 `{"Name":"test","Score":90}`
- 审批 form: JSON 字符串, 格式参考飞书审批定义
- IM 发消息默认 `--receive-type chat_id`, 发给个人用 `--receive-type open_id`
- `--as user` 以用户身份操作, `--as bot` (默认) 以机器人身份
