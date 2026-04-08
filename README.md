<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">164 个飞书 API，~695 tokens 上下文，不挑 Agent。</p>
  <p align="center">
    <a href="#快速开始">快速开始</a> · <a href="#为什么不用官方方案">为什么不用官方方案</a> · <a href="./README.en.md">English</a>
  </p>
</p>

---

## 这是什么

名字里的 "Max Saver" 不是营销话术，是字面意思：**最大限度节省 Agent 上下文**。

AI Agent 接入飞书，主流方案要吃掉 15,000+ tokens 的上下文窗口——光加载工具列表就烧完了，还没开始干活。本项目把这个数字压到 **~695 tokens**。164 个 API 端点，29 类能力，上下文成本只有官方方案的 **5%**。

```bash
feishu doc search "Q2 周报"                    # 搜文档
feishu im send oc_xxx --content "部署完成"      # 发消息
feishu bitable search-records app_xxx tbl_xxx   # 查多维表格
feishu calendar freebusy --start ... --end ...  # 查空闲忙碌
feishu mail send me --to addr --subject 标题 --body '<html>'  # 发邮件
feishu event subscribe                          # 实时事件流
feishu tool call <任意API名> '<json>'           # 调 146 个端点中的任何一个
```

输出全是 JSON，Agent 直接消费。不挑框架——能跑 shell 的 Agent 都能用。

## 为什么不用官方方案

| 方案 | 上下文成本 | Agent 兼容性 | 加载方式 | 需要管理员审批 |
|------|-----------|-------------|---------|--------------|
| 飞书官方 MCP（1350+ 工具） | ~15,000+ tokens | 仅 MCP 客户端 | 启动全量加载 | 否（个人身份） |
| 飞书官方 CLI（19 个 Skill 文件） | ~15,000+ tokens | 仅 npx skills | 启动全量加载 | 否（个人身份） |
| **本项目** | **~695 tokens** | **任何 Agent** | **按需触发** | **可选（双引擎）** |

### 三刀砍到 ~695 tokens

三个设计决策叠加出来的效果：

**第一刀：两层加载，不一次灌完。** SKILL.md（~695 tokens）只放能力概览和常用命令模式，日常常驻。完整的 100+ 条命令参考（~3,600 tokens）放在 `references/commands.md`，Agent 需要具体参数时才读取。大多数场景只用第一层。

**第二刀：CLI 而非 MCP。** MCP 协议要求在连接时将所有工具的 JSON Schema 注入上下文，1350 个工具就是 1350 份 Schema。本项目走 CLI 路线——Agent 直接执行 `feishu <命令>`，不需要预加载任何 Schema。打个比方：MCP 是背着 1350 件套工具箱出门，CLI 是揣一本口袋手册。

**第三刀：Skill 协议按需触发。** Skill 是对话里提到"飞书"才加载，用完就走。MCP Server 是启动就常驻，不管这次对话用不用飞书。你的 Agent 有 20 个工具，一次对话通常只用 2-3 个，Skill 模式下不提飞书就不占位。

三刀下去：~695 vs 15,000，省 95%。

### 双引擎：REST API + 官方 MCP

本项目不是和官方 MCP 二选一，而是**把官方 MCP 吸收为内部后端**。CLI 内部自己当 MCP 客户端，处理好数据再返回给 Agent：

```
Agent → feishu CLI → REST API（Bot 身份）先试
                   → 权限不足？→ 自动切到官方 MCP（个人身份）
                   → Agent 只看到干净 JSON，不知道走了哪条路
```

- 有应用凭证 → REST 为主，MCP 兜底（权限零摩擦）
- 只有个人 MCP → 也能独立工作（零审批，零应用创建）
- 两个都没有 → 提示配置指引

### 本项目有而官方 CLI 没有的

审批流程、OKR、考勤记录、汇报规则、管理后台（审计日志/统计）— 5 个企业管理领域，官方 CLI 的 open issues 里还在排队。

### 与官方 CLI 的差距

**6 个原始差距已全部解决：** ~~完整邮件系统~~ 已补（send/list/draft/folder）。~~Event WebSocket 订阅~~ 已补（`feishu event subscribe`）。~~Whiteboard 图表渲染~~ 已补（Mermaid workflow）。~~交互式 OAuth 登录~~ 已补（`feishu auth login`）。~~任务子任务和提醒~~ 已补。~~文档媒体插入~~ 已补（upload-image/upload-file）。

## 164 个端点，按场景看

🔄 **办公自动化** — 搜文档、写文档、往文档里插图片/文件、更新多维表格（批量操作/字段/视图管理）、创建审批、查任务/子任务。Markdown 写入飞书文档，自动转换为飞书 Block 格式。

💬 **IM 全家桶** — 发消息、回复、转发、撤回、查已读、表情回应、消息置顶、合并转发、加急通知（app/短信/电话）。群管理：建群、改群、拉人、踢人、设公告、搜群、分享链接。

📅 **日程与会议** — 查日历、创建事件、查空闲忙碌（freebusy）、管理参会者、RSVP 回复、展开重复事件、预约视频会议、拉取妙记转写。

📧 **邮件系统** — 发送邮件、收件箱列表、邮件详情、创建/发送/删除草稿、文件夹管理。需要 `--as user` 用户身份。

📊 **企业管理** — OKR（列表/详情/周期）、考勤（打卡记录/统计/班次）、汇报规则、审计日志、部门和用户统计、通讯录、企业百科。

🔔 **实时事件** — `feishu event subscribe` 长连接监听飞书事件流，NDJSON 输出，自动重连。Agent 可作为后台子进程运行。

## 不挑 Agent，不绑框架

官方飞书 MCP 绑定 MCP 协议，官方 CLI 绑定 npx skills 框架。换个 Agent 就得换工具。

本项目不绑任何框架——Claude Code、Gemini CLI、Codex、Cursor、自研 Agent，甚至一个能执行 bash 的脚本都行。把 `skill/` 目录注册到 Agent 的 Skill 加载路径，或者直接把 SKILL.md 喂进系统提示。

## 快速开始

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install && npm run build && npm link
```

配置飞书连接（二选一或同时配置）：

```bash
# 方式一：个人 MCP（零审批，在 https://open.feishu.cn/page/mcp/ 生成 URL）
feishu config set-mcp --name contacts --url "你的MCP_URL"
feishu config set-mcp --name im --url "你的MCP_URL"
# ... 按需添加更多（详见 skill/references/setup.md）

# 方式二：应用直连（在 https://open.feishu.cn 创建应用，需管理员审批）
feishu config set --app-id <app_id> --app-secret <app_secret>
```

注册为 AI Skill（按你使用的 Agent 选择）：

```bash
# Claude Code
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Gemini CLI
ln -sf "$(pwd)/skill" ~/.gemini/skills/feishu

# 其他 Agent — 将 skill/ 目录注册到 Agent 的 Skill 加载路径即可
# 或者直接让 Agent 读取 skill/SKILL.md 作为系统提示的一部分
```

注册后，AI 会话中提到"飞书"自动触发。适用于任何能执行 shell 命令的 Agent。

## 三身份模式

| 模式 | 命令 | 行为 |
|------|------|------|
| **auto**（默认） | `feishu ...` | Bot REST 优先，权限不足自动 fallback 个人 MCP |
| user | `feishu --as user ...` | 用户 REST 优先，权限不足 fallback MCP |
| bot | `feishu --as bot ...` | 仅 Bot REST，不 fallback |

```bash
feishu task list                                   # auto: bot 403 → 自动走 MCP
feishu --as user calendar list-events <calId>      # 用户身份
feishu --as bot im send oc_xxx --content "通知"    # 强制 bot
```

## 配置方式

两种方式可单独使用，也可同时配置（推荐）。

### 个人 MCP（零审批，推荐先配）

在 [飞书 MCP 配置页](https://open.feishu.cn/page/mcp/) 按需生成 URL，然后：

```bash
feishu config set-mcp --name contacts --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
feishu config set-mcp --name im --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
# ... 按需添加 docx / bitable_wiki / calendar / task
feishu config list-mcp                             # 查看已配置的端点
```

详细创建指引见 `skill/references/setup.md`。

### 应用直连（需管理员审批，支持 Bot 和文件上传）

```bash
feishu config set --app-id <id> --app-secret <secret>
feishu auth login                                  # 可选：OAuth 获取用户 token
feishu config show
```

## 输出格式

```
成功 → stdout: {"data": {...}}
失败 → stderr: {"error": "...", "code": "..."}
```

## Workflow 模板

内置三个多步骤工作流模板（`skill/references/workflows.md`）：

- **会议纪要汇总** — 查日历 → 查 VC → 查妙记 → 生成结构化报告
- **站会日报** — 查日历 + 查任务 → 生成每日摘要
- **图表插入文档** — Mermaid → PNG → upload-image → block create（按需安装 mermaid-cli）

## 开发

```bash
npm run dev       # watch 模式
npm test          # 58 个测试
npm run build     # 构建
```

## License

MIT
