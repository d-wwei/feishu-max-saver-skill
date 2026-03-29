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

检查配置是否就绪：

```bash
feishu config show
```

如果未配置，两种模式二选一：

```bash
# 直连模式（推荐）
feishu config set --app-id <id> --app-secret <secret>

# Proxy 模式（通过 MCP 端点转发）
feishu config set --url <飞书 MCP 端点 URL>
```

直连模式需要在[飞书开放平台](https://open.feishu.cn)创建应用，开通权限：`docx:document`、`search:docs`、`drive:file`、`wiki:wiki:readonly`。

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
