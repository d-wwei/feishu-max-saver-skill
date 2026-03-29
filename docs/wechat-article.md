# 飞书官方出了 CLI，1657 Star——我研究了一圈，还是没换

**一句话版：** 官方 CLI 有 200+ 命令和 2500 个 API，但我的方案只要 655 tokens 上下文就能干 90% 的活。

---

你的 Agent 接入飞书后，上下文窗口瞬间少了 15,000 tokens。

不是因为跑了什么复杂任务。光加载工具列表就烧掉了这么多。飞书官方 MCP 有 1350+ 个工具定义，每个都是一份 JSON Schema，连接时全量注入上下文。Agent 还没开口说话，"思考预算"已经花掉了一大截。

15,000 tokens 什么概念？实际跑起来，系统提示、用户历史、其他工具、代码片段一叠加，留给飞书的可能就几万 token。15,000 的开销不是理论数字——它直接挤压 Agent 处理复杂任务的空间。

上周飞书开放平台发了官方 CLI（github.com/larksuite/cli），3 天 1657 Star。我认真研究了一圈：200+ 命令，三层架构（Shortcuts + API Commands + Raw API），19 个 Agent Skill 文件，2500+ 原始 API。做得确实扎实。

然后我算了笔账。

## 一笔 Token 账

| 方案 | 上下文成本 | 能用的 Agent | 加载方式 |
|------|-----------|-------------|---------|
| 飞书官方 MCP（1350+ 工具） | 🔴 ~15,000+ tokens | 仅 MCP 客户端 | 启动全量加载 |
| 飞书官方 CLI（19 个 Skill 文件） | 🔴 ~15,000+ tokens | 仅 npx skills 框架 | 启动全量加载 |
| **Feishu Max Saver Skill** | 🟢 **~655 tokens** | **任何 Agent** | **按需触发** |

655 vs 15,000。省 96%。同样覆盖 125 个 API 端点，上下文成本差了 23 倍。

这不是玄学。三个设计决策叠出来的。

## 三刀砍到 655 tokens

**第一刀：两层加载，不一次灌完。**

SKILL.md 只放能力概览和常用命令模式，大约 655 tokens，日常常驻。完整的 80+ 条命令参考单独放在 `references/commands.md`（约 3,600 tokens），Agent 需要具体参数时才读取。

大多数场景只用第一层。Agent 看到 `feishu doc search` 就知道怎么搜文档，不需要先把 18 个多维表格命令的完整参数背一遍。

**第二刀：走 CLI，不走 MCP。**

MCP 协议的机制是连接时把所有工具的 JSON Schema 注入上下文。1350 个工具 = 1350 份 Schema。

CLI 方案里 Agent 直接执行 `feishu <命令>`。没有 Schema 预加载，没有工具列表注入。用完即走。

打个比方：MCP 是背着 1350 件套工具箱出门，CLI 是揣一本口袋手册。

**第三刀：Skill 协议按需触发。**

Skill 和 MCP Server 最大的区别——Skill 是对话里提到"飞书"才激活，MCP Server 是启动就常驻。你的 Agent 有 20 个工具，一次对话通常只用 2-3 个，剩下 17 个的上下文全浪费了。Skill 模式下，不提飞书就不占位。

三刀下去：655 tokens。

## 该诚实的地方

官方 CLI 有几个能力我确实做不到：

- **完整邮件系统**（收/发/草稿/回复/标签）——我只有邮件组查询
- **任务子任务和提醒**——我只有基础 CRUD
- **文档里插图片和文件**——我的 doc write 只吃 Markdown
- **交互式 OAuth 登录**——我需要手动粘贴 token
- **WebSocket 实时事件订阅**——我是 CLI，不是常驻服务
- **白板图表渲染**——我不做

但反过来，5 个企业管理领域是**我有、官方没有的**：审批流程、OKR、考勤记录、汇报规则、管理后台（审计日志/统计）。这些在官方 CLI 的 GitHub Issues 里还在排队。

选哪个取决于你的场景。重度依赖邮件和 WebSocket？官方更合适。做文档读写、消息收发、表格操作、日历管理这些高频操作？655 tokens 的方案性价比高得多。

## 29 类能力，按场景看

🔄 **办公自动化** — 搜文档、写文档、更新多维表格（支持批量操作和字段管理）、创建审批、查任务。Markdown 写入飞书文档，自动转换为飞书 Block 格式。

💬 **IM 全家桶** — 发消息、回复、转发、撤回、查已读。还有表情回应、消息置顶、合并转发、加急通知（app/短信/电话三种方式）。群管理：建群、改群、拉人、踢人、设公告、搜群、获取分享链接。

📅 **日程与会议** — 查日历、创建事件、查空闲忙碌（freebusy）、管理参会者、RSVP 回复、展开重复事件、预约视频会议、拉取妙记转写。

📊 **企业管理** — OKR（列表/详情/周期）、考勤（打卡记录/统计/班次）、汇报规则、审计日志、部门和用户使用统计、通讯录、企业百科。

支持 `--as user` 切换用户身份，访问个人日历和任务。还有两个内置 Workflow 模板：会议纪要汇总和站会日报。

不够用？`feishu tool call <API名> '<json>'` 直接调用 125 个端点中的任何一个。

## 不挑 Agent

能跑 shell 的 Agent 都能用。不绑定 MCP，不绑定 npx skills，不绑定任何特定框架。

Claude Code、Gemini CLI、Codex、自研 Agent——注册为 Skill 后，对话里提到"飞书"自动触发。

还有一个细节：当 Agent 通过飞书 IM 桥接和你对话时，它不会傻傻地再调 `im send` 发一遍消息，而是直接在对话流里回复。只有主动通知第三方时才走 API。这种边界感是踩了坑之后才会加的规则。

## 3 分钟上手

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install && npm run build && npm link

# 配置飞书应用（在 open.feishu.cn 创建）
feishu config set --app-id <你的app_id> --app-secret <你的app_secret>

# 注册为 Skill（按你的 Agent 选择）
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu   # Claude Code
ln -sf "$(pwd)/skill" ~/.gemini/skills/feishu   # Gemini CLI
# 其他 Agent：symlink skill/ 到 Agent 的 Skill 加载路径
```

5 步。从零到能用。

## 最后

655 tokens。125 个 API。29 类能力。5 个官方还没做的领域。

官方 CLI 做得不错，解决的是"全量覆盖"的问题。我要解决的是"Agent 上下文寸土寸金"的问题。两个问题，两个答案。

仓库在这里，代码全开源：https://github.com/d-wwei/feishu-max-saver-skill
