<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">Give your AI Agent hands for Feishu</p>
  <p align="center">
    <a href="#installation">Installation</a> · <a href="#why-not-mcp">Why Not MCP?</a> · <a href="./README.md">中文</a>
  </p>
</p>

---

## What Is This

Feishu Max Saver Skill is a **full-platform Feishu/Lark CLI**, purpose-built for AI Agents.

In one line: **4% of the context cost, 90% of Feishu's common operations, works with any Agent.**

```
feishu doc search "Q2 weekly report"
feishu im send oc_xxx --content "Deploy complete ✅"
feishu bitable list app_xxx
feishu calendar list
```

All output is structured JSON, ready for AI consumption.

## Why Not MCP?

| Approach | Context Cost | Agent Compatibility | Loading |
|----------|-------------|-------------------|---------|
| Official Feishu MCP (1350+ tools) | 🔴 Massive (always resident) | MCP clients only | Loaded at startup |
| feishu-cli MCP mode | 🟡 ~14,000 tokens | MCP clients only | Loaded at startup |
| **Feishu Max Saver Skill** | 🟢 **~550 tokens** | **Any Agent** | **On-demand** |

> MCP gives your Agent a toolbox — 1350 tool definitions injected into context at startup, most never used.
>
> Feishu Max Saver gives your Agent a cheat-sheet + a universal CLI — loaded when "Feishu" is mentioned, gone when done.

**96% less context (25x difference)**. For an Agent, context is both cost and intelligence.

## Capabilities

26 categories of Feishu capabilities, one CLI:

| Category | Commands | Description |
|----------|----------|-------------|
| 📄 Docs | `doc search / read / create / write / delete` | Full lifecycle management |
| 🧱 Blocks | `block list / create / update / delete` | Block-level operations within docs |
| 📁 Folders | `folder list / create` | Drive folder management |
| 📚 Wiki | `wiki get / search / convert` | Knowledge base operations |
| 💬 Messages | `im send / reply / forward / delete / read-status` | Send, forward, recall, read status |
| 🖼️ Rich Media | `im send-image / send-file` | Image and file messages |
| 👥 Groups | `chat create / members / add-members / remove-members` | Group management |
| 📢 Announcements | `chat get-announcement / set-announcement` | Group announcement management |
| 📊 Bitable | `bitable list / records / create-record / update-record` | Table CRUD |
| 📅 Calendar | `calendar list / events / create-event` | Calendar and events |
| ✅ Tasks | `task list / create / update / complete` | Task management |
| ✍️ Approval | `approval list / create / approve / reject` | Approval workflows |
| 📋 Sheets | `sheets list / read / write` | Spreadsheet operations |
| 👤 Contacts | `contact search / get` | User directory lookup |
| 💬 Comments | `comment list / create` | Document comments |
| 🔍 Search | `search` | Global search |
| 🎥 Video Conf | `vc list / create` | Video conferencing |
| 📝 Minutes | `minutes list / get` | Meeting minutes |
| 🎯 OKR | `okr list / get` | Objectives & Key Results |
| 📊 Attendance | `attendance records` | Attendance data |
| 📮 Mail | `mail send` | Send emails |
| 📖 Lingo | `lingo search` | Enterprise glossary |
| 🔐 Permissions | `permission get / update` | Document permissions |
| 📈 Reports | `report list` | Report queries |
| 🏢 Tenant | `tenant info` | Tenant information |
| 🛠️ General | `tool list / call` | Call any Feishu API |

## Installation

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install
npm run build
npm link  # Makes 'feishu' command globally available
```

### Register as AI Agent Skill

```bash
# macOS / Linux
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Windows (PowerShell, admin required)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\feishu" -Target "$(Get-Location)\skill"
```

Once registered, any mention of "Feishu" or "Lark" in an AI session auto-triggers the Skill. Works with Claude Code, Gemini CLI, and any Agent that supports Skills.

## Configuration

### Direct Mode (Recommended)

```bash
feishu config set --app-id <app_id> --app-secret <app_secret>
```

Requires creating an app on the [Feishu Open Platform](https://open.feishu.cn) with appropriate permissions.

### Proxy Mode

```bash
feishu config set --url <Feishu MCP endpoint URL>
```

### View Config

```bash
feishu config show
```

## Output Format

All commands output JSON. Success goes to stdout, errors to stderr:

```json
// Success
{"data": { ... }}

// Error
{"error": "error message", "code": "ERROR_CODE"}
```

## Development

```bash
npm run dev          # Watch mode
npm test             # Run tests
npm run build        # Build
```

## License

MIT
