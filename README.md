<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">125 个飞书 API，655 tokens 上下文，不挑 Agent。</p>
  <p align="center">
    <a href="#快速开始">快速开始</a> · <a href="#为什么不用官方方案">为什么不用官方方案</a> · <a href="./README.en.md">English</a>
  </p>
</p>

---

## 这是什么

一个飞书全平台 CLI，给 AI Agent 用的。125 个 REST API 端点，29 类能力，双身份模式。

```bash
feishu doc search "Q2 周报"                    # 搜文档
feishu im send oc_xxx --content "部署完成"      # 发消息
feishu bitable search-records app_xxx tbl_xxx   # 查多维表格
feishu calendar freebusy --start ... --end ...  # 查空闲忙碌
feishu tool call <任意API名> '<json>'           # 调 125 个端点中的任何一个
```

输出全是 JSON，Agent 直接消费。

## 为什么不用官方方案

| 方案 | 上下文成本 | Agent 兼容性 | 加载方式 |
|------|-----------|-------------|---------|
| 飞书官方 MCP（1350+ 工具） | ~15,000+ tokens | 仅 MCP 客户端 | 启动全量加载 |
| 飞书官方 CLI（19 个 Skill 文件） | ~15,000+ tokens | 仅 npx skills | 启动全量加载 |
| **本项目** | **~655 tokens** | **任何 Agent** | **按需触发** |

655 vs 15,000 — 省 96% 上下文。对 Agent 来说，省下的上下文就是多出来的思考空间。

**按需两层架构：** SKILL.md（~655 tokens）日常常驻，完整命令参考（~3,600 tokens）仅在需要具体参数时加载。大多数场景只用第一层。

### 本项目有而官方 CLI 没有的

审批流程、OKR、考勤记录、汇报规则、管理后台（审计日志/统计）— 5 个企业管理领域，官方 CLI 的 open issues 里还在排队。

## 29 类能力

**文档与知识库** — doc（搜索/读写/创建/删除）、block（增删改查）、folder、wiki、comment、permission、search

**IM 与协作** — im（发送/回复/转发/撤回/已读/表情回应/置顶/合并转发/加急）、chat（建群/改群/群成员/群公告/群搜索/分享链接）

**数据与表格** — bitable（CRUD/批量操作/字段管理/视图管理）、sheets（读写/追加）

**日程与会议** — calendar（事件CRUD/搜索/RSVP/参会者管理/空闲忙碌/重复事件展开）、vc（预约/查询）、minutes（妙记/统计）

**企业管理** — task、approval、okr、attendance、report、contact、mail、lingo、tenant、admin

**通用** — `feishu tool call <API名> '<json>'` 直接调用 125 个端点中的任何一个

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

注册为 AI Skill：

```bash
# macOS / Linux
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Windows (PowerShell, 管理员)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\feishu" -Target "$(Get-Location)\skill"
```

注册后，AI 会话中提到"飞书"自动触发。适用于 Claude Code、Gemini CLI 等任何支持 Skill 协议的 Agent。

## 双身份模式

默认以机器人身份（bot）操作。加 `--as user` 切换为用户身份，访问个人日历、任务等资源：

```bash
feishu calendar list-events <calId> --as user     # 用户身份查日历
feishu config set --user-access-token <token>      # 配置用户 token
```

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
