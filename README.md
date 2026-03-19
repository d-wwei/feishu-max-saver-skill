# feishu-cli

飞书命令行工具，输出结构化 JSON，方便 AI 和脚本消费。

支持两种连接模式：

- **Proxy 模式** — 通过 MCP 端点连接飞书（14 个工具）
- **Direct 直连模式** — 通过飞书 REST API 直连（完整能力，包括 block 操作、文件夹管理等）

## 安装

```bash
git clone https://gitlab.futunn.com/leohuang/feishu-cli.git
cd feishu-cli
npm install
npm run build
npm link  # 全局可用 feishu 命令
```

### 给 AI 用（Claude Code Skill）

```bash
# macOS / Linux
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Windows (PowerShell, 需管理员权限)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\feishu" -Target "$(Get-Location)\skill"
```

注册后，AI 会话中提到"飞书"相关操作会自动触发 skill，AI 直接知道怎么调用。

## 配置

### Proxy 模式

```bash
feishu config set --url <飞书 MCP 端点 URL>
```

### Direct 直连模式

```bash
feishu config set --app-id <app_id> --app-secret <app_secret>
```

需要在[飞书开放平台](https://open.feishu.cn)创建应用并开通对应权限：

| 权限 | 用途 |
|------|------|
| `docx:document` | 文档读写 |
| `search:docs` | 文档搜索 |
| `drive:file` | 文件/文件夹操作 |
| `wiki:wiki:readonly` | Wiki 读取 |

### 查看当前配置

```bash
feishu config show
```

## 命令

### 文档

```bash
feishu doc search <关键词>              # 搜索文档
feishu doc read <documentId>            # 读取文档纯文本
feishu doc info <documentId>            # 获取文档元信息
feishu doc create --title <标题>        # 创建空文档（直连模式）
feishu doc create --content <markdown>  # 从 markdown 创建（proxy 模式）
feishu doc delete <documentId>          # 删除文档（需确认）
feishu doc delete <documentId> -y       # 跳过确认直接删除
feishu doc write <documentId> --content '# 标题\n\n正文'  # 写入 markdown
feishu doc write <documentId> --content '<md>' --index 0  # 插入到开头
```

### Block 操作（直连模式）

```bash
feishu block list <docId>
feishu block update <docId> <blockId> --body '<json>'
feishu block create <docId> <parentBlockId> --body '<json>'
feishu block delete <docId> <parentBlockId> --start 0 --end 2
```

### 文件夹（直连模式）

```bash
feishu folder list <folderToken>
feishu folder create --parent <token> --name <名称>
```

### Wiki

```bash
feishu wiki get <token>                         # 获取 Wiki 节点信息
feishu wiki search <关键词>                      # 搜索 Wiki 页面
feishu wiki search <关键词> --count 20           # 指定返回数量
feishu wiki convert <url>                        # Wiki URL 转文档 ID
feishu wiki convert abc123                       # 纯 token 也行
```

### 通用工具调用

```bash
feishu tool list                        # 列出所有可用工具
feishu tool call <工具名> '<json参数>'   # 直接调用任意工具
```

## 输出格式

所有命令输出 JSON，成功时写 stdout，失败时写 stderr：

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
