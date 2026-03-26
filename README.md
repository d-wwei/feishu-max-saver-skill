<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">让 AI Agent 长出飞书的手</p>
  <p align="center">
    <a href="#安装">安装</a> · <a href="#为什么不用-mcp">为什么不用 MCP？</a> · <a href="./README.en.md">English</a>
  </p>
</p>

---

## 这是什么

Feishu Max Saver Skill 是一个**飞书全平台 CLI 工具**，专门为 AI Agent 设计。

一句话：**用 4% 的上下文成本，覆盖 90% 的飞书常用操作，且不挑 Agent。**

```
feishu doc search "Q2 周报"
feishu im send oc_xxx --content "部署完成 ✅"
feishu bitable list app_xxx
feishu calendar list
```

所有输出都是结构化 JSON，AI 直接消费。

## 为什么不用 MCP？

| 方案 | 上下文开销 | Agent 兼容性 | 加载方式 |
|------|-----------|-------------|---------|
| 飞书官方 MCP（1350+ 工具） | 🔴 巨大（全量常驻） | 仅 MCP 客户端 | 启动即加载 |
| feishu-cli MCP 模式 | 🟡 ~14,000 tokens | 仅 MCP 客户端 | 启动即加载 |
| **Feishu Max Saver Skill** | 🟢 **~550 tokens** | **任何 Agent** | **按需触发** |

> MCP 是"给 Agent 一个工具箱"——1350 个工具定义全量灌入上下文，大部分永远不会用到。
>
> Feishu Max Saver 是"给 Agent 一本操作手册 + 一个万能命令行"——提到"飞书"才加载，用完就走。

**上下文省 96%（25 倍差距）**。对 Agent 来说，上下文就是钱和智力。

## 覆盖能力

26 大类飞书能力，一个命令行全搞定：

| 类别 | 命令 | 说明 |
|------|------|------|
| 📄 文档 | `doc search / read / create / write / delete` | 全生命周期管理 |
| 🧱 Block | `block list / create / update / delete` | 文档内 block 级操作 |
| 📁 文件夹 | `folder list / create` | 云空间文件夹管理 |
| 📚 Wiki | `wiki get / search / convert` | 知识库操作 |
| 💬 消息 | `im send / reply / forward / delete / read-status` | 收发、转发、撤回、已读 |
| 🖼️ 富媒体 | `im send-image / send-file` | 图片和文件消息 |
| 👥 群聊 | `chat create / members / add-members / remove-members` | 群管理 |
| 📢 群公告 | `chat get-announcement / set-announcement` | 公告管理 |
| 📊 多维表格 | `bitable list / records / create-record / update-record` | 数据表 CRUD |
| 📅 日历 | `calendar list / events / create-event` | 日程管理 |
| ✅ 任务 | `task list / create / update / complete` | 任务管理 |
| ✍️ 审批 | `approval list / create / approve / reject` | 审批流程 |
| 📋 表格 | `sheets list / read / write` | 电子表格 |
| 👤 通讯录 | `contact search / get` | 查询用户信息 |
| 💬 评论 | `comment list / create` | 文档评论 |
| 🔍 搜索 | `search` | 全局搜索 |
| 🎥 会议 | `vc list / create` | 视频会议 |
| 📝 会议纪要 | `minutes list / get` | 纪要查询 |
| 🎯 OKR | `okr list / get` | 目标管理 |
| 📊 考勤 | `attendance records` | 考勤数据 |
| 📮 邮件 | `mail send` | 发送邮件 |
| 📖 词典 | `lingo search` | 企业词典 |
| 🔐 权限 | `permission get / update` | 文档权限 |
| 📈 报表 | `report list` | 报表查询 |
| 🏢 租户 | `tenant info` | 租户信息 |
| 🛠️ 通用 | `tool list / call` | 调用任意飞书 API |

## 安装

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install
npm run build
npm link  # 全局可用 feishu 命令
```

### 给 AI Agent 注册 Skill

```bash
# macOS / Linux
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Windows (PowerShell, 需管理员权限)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\feishu" -Target "$(Get-Location)\skill"
```

注册后，AI 会话中提到"飞书"相关操作会自动触发 Skill。适用于 Claude Code、Gemini CLI 等任何支持 Skill 的 Agent。

## 配置

### Direct 直连模式（推荐）

```bash
feishu config set --app-id <app_id> --app-secret <app_secret>
```

需要在[飞书开放平台](https://open.feishu.cn)创建应用并开通对应权限。

### Proxy 模式

```bash
feishu config set --url <飞书 MCP 端点 URL>
```

### 查看配置

```bash
feishu config show
```

## 输出格式

所有命令输出 JSON，成功写 stdout，失败写 stderr：

```json
// 成功
{"data": { ... }}

// 失败
{"error": "错误信息", "code": "ERROR_CODE"}
```

## 开发

```bash
npm run dev          # watch 模式编译
npm test             # 运行测试
npm run build        # 构建
```

## License

MIT
