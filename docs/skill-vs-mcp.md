# 用 CLI Skill 替代飞书 MCP：省下 96% 的上下文

## 背景

AI Agent（Claude Code、Gemini CLI、Cursor 等）操作飞书文档有两种方式：

- **MCP 方案** — 通过 MCP Server 注册工具，AI 直接调用
- **CLI Skill 方案** — 通过一份轻量指令文件，教 AI Agent 用命令行操作飞书

两种方案功能上等价，都能搜索、读写、创建、删除飞书文档。但上下文开销差了一个数量级。

## 问题：MCP 工具定义太重了

MCP 的工作方式是在会话启动时把所有工具的完整定义（描述 + JSON Schema）注入上下文。飞书 MCP 有 14 个工具，每个工具都带完整的参数 schema，包括嵌套类型、枚举值、默认值说明等。

这些定义**始终占用上下文**，不管你这次会话是不是在操作飞书。

其中 `batch_create_feishu_blocks` 一个工具的 schema 就包含了 text、code、heading、list、image、mermaid、timeline、table、callout 九种 block 类型的完整参数定义，嵌套了样式、对齐、链接、公式等子结构。光这一个工具就占了将近一半的开销。

## 测试结果

我们对两种方案做了上下文占用的量化对比：

| 方案 | 字符数 | 近似 Tokens | 加载时机 |
|------|--------|------------|----------|
| MCP（14 个工具定义） | ~35,000 | ~14,000 | **始终占用**，每次会话都在 |
| CLI Skill（SKILL.md） | ~1,400 | ~550 | **按需加载**，提到飞书才触发 |

### 关键数字

- MCP 方案的上下文开销是 Skill 的 **25 倍**
- 单工具 `batch_create_feishu_blocks` 的 schema 就有 ~17,800 字符（~7,100 tokens）
- 切换到 Skill 方案后，**不使用飞书时上下文零开销**；使用时也只多 ~550 tokens

### 各工具开销明细

| MCP 工具 | 近似字符数 | 说明 |
|----------|-----------|------|
| batch_create_feishu_blocks | ~17,800 | 占比最大，9 种 block 类型的完整 schema |
| update_feishu_block_text | ~2,300 | 富文本样式的嵌套定义 |
| create_nested_feishu_blocks | ~1,400 | 嵌套 block 关系 |
| convert_content_to_feishu_document | ~1,000 | Markdown/HTML 转换 |
| 其余 10 个工具 | 各 200~700 | 相对轻量 |

## 为什么 Skill 能做到更轻

思路很简单：**把 API 知识从 schema 变成说明书**。

MCP 方案要求模型理解每个参数的 JSON Schema 结构，所以必须把完整的类型定义放在上下文里。而 CLI Skill 只需要告诉模型"用什么命令、传什么参数"，一行命令就能表达 MCP 需要几十行 schema 才能描述的操作。

举个例子，在飞书文档里创建 block：

**MCP 方案**需要在上下文里放完整的 `batch_create_feishu_blocks` schema（~7,100 tokens），模型才知道怎么构造参数。

**Skill 方案**只需要一行：
```
feishu block create <docId> <parentBlockId> --body '<json>'
```

block body 的 JSON 格式参考飞书开放平台文档，不需要在 Skill 里重复定义。

另外，Skill 还用了**分层加载**的设计：
- `SKILL.md`（~50 行）只放每次都需要的命令速查
- `references/setup.md` 放安装、配置、操作示例，只在首次配置时读取

## 功能对比

| 操作 | MCP | CLI Skill |
|------|-----|-----------|
| 搜索文档 | `search_feishu_documents` | `feishu doc search` |
| 读取文档 | `get_feishu_document_raw_content` | `feishu doc read` |
| 获取文档信息 | `get_feishu_document_info` | `feishu doc info` |
| 创建文档 | `create_feishu_document` | `feishu doc create` |
| 删除文档 | ❌ 不支持 | `feishu doc delete` |
| 列出 block | `get_feishu_document_blocks` | `feishu block list` |
| 更新 block | `update_feishu_block_text` | `feishu block update` |
| 创建 block | `batch_create_feishu_blocks` | `feishu block create` |
| 删除 block | `delete_feishu_document_blocks` | `feishu block delete` |
| 嵌套 block | `create_nested_feishu_blocks` | `feishu block create`（通过 body JSON） |
| Markdown 写入（新文档） | `convert_content_to_feishu_document` | `feishu doc create --content` |
| Markdown 写入（已有文档） | `convert_content_to_feishu_document` | `feishu doc write` |
| Wiki 搜索 | `search_feishu_wiki` | `feishu wiki search` |
| Wiki 转换 | `convert_feishu_wiki_to_document_id` | `feishu wiki convert` |
| 文件夹操作 | `get_feishu_folder_files` / `create_feishu_folder` | `feishu folder list` / `feishu folder create` |
| 通用工具调用 | ❌ | `feishu tool call`（可调用任意 API） |

CLI Skill 完整覆盖了 MCP 的全部 14 个工具，还多了文档删除和通用工具调用。

### 覆盖范围说明

上面的对比针对的是社区常见的 14 工具飞书 MCP（专注文档操作）。飞书官方另有一个 [lark-openapi-mcp](https://github.com/larksuite/lark-openapi-mcp)，把整个飞书开放平台的 API 都封装成了 MCP 工具，覆盖 61 个业务域、1350+ 个工具，包括：

| 业务域 | 工具数 | 说明 |
|--------|--------|------|
| 招聘 hireV1 | 175 | 职位、候选人、面试全流程 |
| 人事 corehrV2 | 126 | 组织架构、员工信息、异动 |
| 通讯录 contactV3 | 70 | 部门、用户、用户组 |
| 邮箱 mailV1 | 67 | 邮件收发、邮件组 |
| 视频会议 vcV1 | 55 | 会议、会议室、录制 |
| IM 消息 imV1 | 54 | 发消息、群管理、消息卡片 |
| 任务 taskV2 | 51 | 任务 CRUD、清单、提醒 |
| 云文档 driveV1 | 49 | 文件上传下载、权限管理 |
| 多维表格 bitableV1 | 46 | 表格、字段、记录、视图 |
| 日历 calendarV4 | 41 | 日程、会议室、忙闲查询 |
| 考勤 attendanceV1 | 37 | 打卡、排班、假期 |
| 审批 approvalV4 | 29 | 审批定义、实例、评论 |
| 电子表格 sheetsV3 | 27 | 读写单元格、样式、筛选 |
| 其余 48 个域 | ~420 | OKR、薪酬、百科、搜索等 |

feishu-cli 目前只覆盖了**云文档 + Wiki + 文件夹**这个子集，对应日常 AI 写文档的核心场景。日历、IM、任务等能力后续可以按需扩展。

如果你需要完整的飞书 API 能力，可以直接用官方 lark-openapi-mcp，但要注意按需配置业务域——1350 个工具的 schema 全加载，上下文开销会非常大。

## 迁移方法

### 1. 安装 feishu-cli

```bash
git clone https://gitlab.futunn.com/leohuang/feishu-cli.git
cd feishu-cli
npm install && npm run build
npm link
```

### 2. 注册 Skill

不同的 AI Agent 注册方式不同：

**Claude Code**
```bash
# macOS / Linux
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Windows (PowerShell, 需管理员权限)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\feishu" -Target "$(Get-Location)\skill"
```

**Gemini CLI**
```bash
# macOS / Linux
ln -sf "$(pwd)/skill/SKILL.md" ~/.gemini/skills/feishu.md

# Windows (PowerShell, 需管理员权限)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.gemini\skills\feishu.md" -Target "$(Get-Location)\skill\SKILL.md"
```

**其他 Agent** — 把 `skill/SKILL.md` 的内容放到对应工具的指令文件（rules / system prompt）里即可。

### 3. 配置凭据

两种模式二选一：

```bash
# 直连模式（推荐）— 通过飞书开放平台应用直连 REST API
feishu config set --app-id <your_app_id> --app-secret <your_app_secret>

# Proxy 模式 — 通过 MCP 服务器端点转发
feishu config set --url <飞书 MCP 端点 URL>
```

### 4. 移除飞书 MCP（可选）

如果之前用了飞书 MCP，可以移除以释放上下文。从你的 Agent 配置中删除飞书相关的 `mcpServers` 条目即可。

### 5. 验证

新开一个会话，说"帮我搜一下飞书文档"，Agent 应该通过 `feishu doc search` 命令执行操作。

## 总结

| | MCP | CLI Skill |
|--|-----|-----------|
| 上下文开销 | ~14,000 tokens（常驻） | ~550 tokens（按需） |
| 功能覆盖 | 14 个工具 | 全覆盖 + 额外功能 |
| 加载方式 | 始终注入 | 提到飞书才加载 |
| 适用范围 | 支持 MCP 的客户端 | 任何 AI Agent |
| 节省 | — | **96% 上下文** |

对于不是每次会话都在用飞书的场景（大多数人），CLI Skill 是更好的选择。而且 Skill 不依赖 MCP 协议，任何能执行 shell 命令的 AI Agent 都能用。
