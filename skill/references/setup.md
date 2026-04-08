# 安装与配置

## 安装

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install && npm run build
npm link                              # 全局可用 feishu 命令
```

注册 Skill（按你使用的 Agent 选择）：

```bash
# Claude Code
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Gemini CLI
ln -sf "$(pwd)/skill" ~/.gemini/skills/feishu

# 其他 Agent — 将 skill/ 目录注册到 Agent 的 Skill 加载路径
# 或直接让 Agent 读取 skill/SKILL.md 作为系统提示
```

## 配置

有两种配置方式，推荐先配个人 MCP（零审批），再按需补充应用直连。

### 方式一：个人 MCP 端点（推荐，无需管理员审批）

使用你的飞书个人身份，权限等同于你在飞书网页端能做的事。

#### 第 1 步：生成 MCP URL

1. 打开 [飞书 MCP 配置页](https://open.feishu.cn/page/mcp/)（需登录飞书账号）
2. 你会看到可用的工具列表，按需创建以下 MCP 服务（每个服务勾选对应工具后会生成一个 URL）：

| 服务名 | 需要勾选的工具 | 用途 |
|--------|--------------|------|
| contacts | authen_v1_userInfo_get, contact_v3_user_get | 用户信息、通讯录 |
| docx | docx_builtin_search, docx_builtin_import, docx_v1_document_rawContent | 文档搜索、创建、读取 |
| bitable_wiki | bitable_v1_* 系列, wiki_v2_space_getNode | 多维表格、Wiki |
| im | im_v1_message_*, im_v1_chat_*, im_v1_chatMembers_* | 消息收发、群管理 |
| calendar | calendar_v4_* 系列 | 日历、日程、忙闲查询 |
| task | task_v2_task_* 系列 | 任务管理 |

> 不需要全部配置。只配你需要的即可，后续随时可以追加。

3. 每个服务创建后，确认传输方式为 **Streamable HTTP**
4. 复制生成的 URL（格式：`https://open.feishu.cn/mcp/stream/mcp_xxxxx`）

#### 第 2 步：配置到 CLI

每拿到一个 URL，运行一次：

```bash
feishu config set-mcp --name contacts --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
feishu config set-mcp --name docx --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
feishu config set-mcp --name bitable_wiki --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
feishu config set-mcp --name im --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
feishu config set-mcp --name calendar --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
feishu config set-mcp --name task --url "https://open.feishu.cn/mcp/stream/mcp_你的URL"
```

#### 第 3 步：验证

```bash
feishu config list-mcp              # 查看已配置的端点
feishu task list                    # 测试：应返回你的任务列表
```

> MCP URL 有效期为 365 天。过期后回到第 1 步重新生成即可。

### 方式二：应用直连（需管理员审批，支持 Bot 身份）

适用于需要 Bot 身份发消息、事件订阅、文件上传等场景。

1. 在 [飞书开放平台](https://open.feishu.cn) 创建应用
2. 开通权限（需管理员审批）：`docx:document`、`search:docs`、`drive:file`、`wiki:wiki:readonly` 等
3. 配置：

```bash
feishu config set --app-id <id> --app-secret <secret>
```

### 两种方式可以同时配置

同时配置后，CLI 默认先用应用直连（Bot 身份），权限不足时自动切换到个人 MCP：

```
feishu wiki get <token>
  → Bot REST API 先试
  → 权限不足？→ 自动 fallback 到个人 MCP
  → 用户无感知
```

强制指定身份：`feishu --as bot ...`（仅 Bot）或 `feishu --as user ...`（仅用户）。

### 管理 MCP 端点

```bash
feishu config set-mcp --name <name> --url <url>   # 添加/更新
feishu config remove-mcp --name <name>             # 删除
feishu config list-mcp                             # 查看全部
feishu config show                                 # 查看完整配置
```

## 常见操作流程

### 搜索并读取文档

```bash
feishu doc search "项目规划"          # 找到 docId
feishu doc read <docId>               # 读取内容
```

### 编辑文档内容

```bash
feishu block list <docId>             # 拿到 block 结构
feishu block update <docId> <blockId> --body '{"update_text_elements": {...}}'
```

### 创建新文档并写入内容

```bash
feishu doc create --title "周报"      # 拿到 document_id
feishu doc write <docId> --content "# 本周总结\n\n- 完成了 X\n- 推进了 Y"
```

也可以用底层 block API 精细控制：

```bash
feishu block list <docId>             # 拿到根 block_id
feishu block create <docId> <rootBlockId> --body '{"children": [...]}'
```

### 搜索 Wiki 并获取文档 ID

```bash
feishu wiki search "技术评审"         # 搜索 Wiki 页面
feishu wiki convert <url|token>       # 拿到文档 ID，可直接用于 doc read/write
```
