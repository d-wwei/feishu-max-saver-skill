<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">134 个飞书 API，655 tokens 上下文，不挑 Agent。</p>
  <p align="center">
    <a href="#快速开始">快速开始</a> · <a href="#为什么不用官方方案">为什么不用官方方案</a> · <a href="./README.en.md">English</a>
  </p>
</p>

---

## 这是什么

名字里的 "Max Saver" 不是营销话术，是字面意思：**最大限度节省 Agent 上下文**。

AI Agent 接入飞书，主流方案要吃掉 15,000+ tokens 的上下文窗口——光加载工具列表就烧完了，还没开始干活。本项目把这个数字压到 **655 tokens**。同样的 134 个 API 端点，29 类能力，上下文成本只有官方方案的 **4%**。

```bash
feishu doc search "Q2 周报"                    # 搜文档
feishu im send oc_xxx --content "部署完成"      # 发消息
feishu bitable search-records app_xxx tbl_xxx   # 查多维表格
feishu calendar freebusy --start ... --end ...  # 查空闲忙碌
feishu tool call <任意API名> '<json>'           # 调 134 个端点中的任何一个
```

输出全是 JSON，Agent 直接消费。不挑框架——能跑 shell 的 Agent 都能用。

## 为什么不用官方方案

| 方案 | 上下文成本 | Agent 兼容性 | 加载方式 |
|------|-----------|-------------|---------|
| 飞书官方 MCP（1350+ 工具） | ~15,000+ tokens | 仅 MCP 客户端 | 启动全量加载 |
| 飞书官方 CLI（19 个 Skill 文件） | ~15,000+ tokens | 仅 npx skills | 启动全量加载 |
| **本项目** | **~655 tokens** | **任何 Agent** | **按需触发** |

### 怎么做到 655 tokens 的

三个设计决策叠加出来的效果：

**1. 两层加载，不一次灌完。** SKILL.md（~655 tokens）只放能力概览和最常用命令模式，日常常驻。完整的 80+ 条命令参考（~3,600 tokens）放在 `references/commands.md`，Agent 需要具体参数时才读取。大多数场景只用第一层。

**2. CLI 而非 MCP。** MCP 协议要求在连接时将所有工具的 JSON Schema 注入上下文，1350 个工具就是 1350 份 Schema。本项目走 CLI 路线——Agent 直接执行 `feishu <命令>`，不需要预加载任何 Schema。

**3. Skill 协议而非 MCP 协议。** Skill 是按需触发的：对话里提到"飞书"才加载 SKILL.md，用完就走。MCP Server 是常驻的：启动就加载，不管这次对话用不用飞书。

三者叠加：655 vs 15,000，省 96%。

### 本项目有而官方 CLI 没有的

审批流程、OKR、考勤记录、汇报规则、管理后台（审计日志/统计）— 5 个企业管理领域，官方 CLI 的 open issues 里还在排队。

### 官方 CLI 有而本项目没有的

透明起见，列出差距：

- **完整邮件系统** — 官方支持邮件 CRUD（收/发/草稿/回复/标签），本项目只有邮件组查询

~~Event WebSocket 订阅~~ 已补（`feishu event subscribe`，NDJSON 事件流，自动重连）。~~Whiteboard 图表渲染~~ 已补。~~交互式 OAuth 登录~~ 已补。~~任务子任务和提醒~~ 已补。~~文档媒体插入~~ 已补。

6 个原始差距已解决 5 个，仅剩完整邮件系统。如果重度依赖邮件收发，官方 CLI 更合适。

这些能力缺失对大多数 Agent 场景影响有限（邮件和 WebSocket 是最可能需要的两个），但如果你的场景重度依赖以上功能，官方 CLI 是更好的选择。

## 29 类能力

**文档与知识库** — doc（搜索/读写/创建/删除）、block（增删改查）、folder、wiki、comment、permission、search

**IM 与协作** — im（发送/回复/转发/撤回/已读/表情回应/置顶/合并转发/加急）、chat（建群/改群/群成员/群公告/群搜索/分享链接）

**数据与表格** — bitable（CRUD/批量操作/字段管理/视图管理）、sheets（读写/追加）

**日程与会议** — calendar（事件CRUD/搜索/RSVP/参会者管理/空闲忙碌/重复事件展开）、vc（预约/查询）、minutes（妙记/统计）

**企业管理** — task、approval、okr、attendance、report、contact、mail、lingo、tenant、admin

**通用** — `feishu tool call <API名> '<json>'` 直接调用 134 个端点中的任何一个

## 快速开始

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install && npm run build && npm link
```

配置飞书应用凭证（在 [飞书开放平台](https://open.feishu.cn) 创建应用）：

```bash
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

## 双身份模式

默认以机器人身份（bot）操作。加 `--as user` 切换为用户身份，访问个人日历、任务等资源：

```bash
feishu auth login                                  # 浏览器 OAuth 授权（一次搞定）
feishu calendar list-events <calId> --as user      # 用户身份查日历
feishu auth status                                 # 查看 token 状态
```

Token 过期后自动用 refresh_token 续期，无需人工干预。适合 Agent 自动化流水线。

## 配置方式

```bash
# Direct 直连（推荐）
feishu config set --app-id <id> --app-secret <secret>

# Proxy 代理
feishu config set --url <飞书 MCP 端点 URL>

# 查看当前配置
feishu config show
```

## 输出格式

```
成功 → stdout: {"data": {...}}
失败 → stderr: {"error": "...", "code": "..."}
```

## Workflow 模板

内置两个多步骤工作流模板（`skill/references/workflows.md`）：

- **会议纪要汇总** — 查日历 → 查 VC → 查妙记 → 生成结构化报告
- **站会日报** — 查日历 + 查任务 → 生成每日摘要

## 开发

```bash
npm run dev       # watch 模式
npm test          # 58 个测试
npm run build     # 构建
```

## License

MIT
