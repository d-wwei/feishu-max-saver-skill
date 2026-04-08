<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">164 Feishu APIs. ~695 tokens of context. Works with any Agent.</p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> · <a href="#why-not-the-official-options">Why Not Official</a> · <a href="./README.md">中文</a>
  </p>
</p>

---

## What Is This

"Max Saver" is literal: **maximum context savings for AI Agents**.

Connecting an AI Agent to Feishu/Lark typically costs 15,000+ tokens of context window — burned on loading tool definitions before any real work begins. This project brings that number down to **~695 tokens**. 164 API endpoints, 29 capability categories, **5% of the context cost**.

```bash
feishu doc search "Q2 report"                    # Search docs
feishu im send oc_xxx --content "Deploy done"    # Send message
feishu bitable search-records app_xxx tbl_xxx    # Query bitable
feishu calendar freebusy --start ... --end ...   # Check availability
feishu mail send me --to addr --subject Title --body '<html>'  # Send email
feishu event subscribe                           # Real-time event stream
feishu tool call <any_api_name> '<json>'         # Call any of 146 endpoints
```

All output is structured JSON. Agent-ready. Framework-agnostic — if your Agent can run shell commands, it works.

## Why Not the Official Options

| Approach | Context Cost | Agent Compatibility | Loading | Admin Approval |
|----------|-------------|-------------------|---------|----------------|
| Official Feishu MCP (1350+ tools) | ~15,000+ tokens | MCP clients only | Full load at startup | No (personal) |
| Official Lark CLI (19 skill files) | ~15,000+ tokens | npx skills only | Full load at startup | No (personal) |
| **This project** | **~695 tokens** | **Any Agent** | **On-demand** | **Optional (dual engine)** |

### Three Cuts to ~695 Tokens

Three design decisions, stacked:

**Cut 1: Two-tier loading.** SKILL.md (~695 tokens) contains only the capability overview and common command patterns — it stays resident. The full 100+ command reference (~3,600 tokens) lives in `references/commands.md` and loads only when the Agent needs specific parameters. Most tasks never hit the second tier.

**Cut 2: CLI, not MCP.** MCP requires injecting JSON schemas for every tool into context at connection time. 1,350 tools = 1,350 schemas. This project takes the CLI route — the Agent runs `feishu <command>` directly. No schemas to preload. Think of it this way: MCP carries a 1,350-piece toolbox out the door; CLI carries a pocket handbook.

**Cut 3: Skill protocol, on-demand.** Skills load when "Feishu" appears in conversation and unload when done. MCP servers are persistent: loaded at startup regardless of whether this conversation needs Feishu at all. Your Agent has 20 tools but uses 2-3 per conversation — Skill mode doesn't occupy context for the other 17.

Combined: ~695 vs 15,000. 95% saved.

### Dual Engine: REST API + Official MCP

This project doesn't compete with the official MCP — it **absorbs it as an internal backend**. The CLI acts as its own MCP client, processes the data, and returns clean JSON to the Agent:

```
Agent → feishu CLI → REST API (bot identity) first
                   → Permission denied? → Auto-fallback to official MCP (personal identity)
                   → Agent only sees clean JSON, unaware of which path was taken
```

- With app credentials → REST primary, MCP fallback (zero permission friction)
- With personal MCP only → Works standalone (zero approval, zero app creation)
- Neither configured → Guides user to setup

### What We Have That the Official CLI Doesn't

Approval workflows, OKR, attendance records, report rules, admin console (audit logs, stats) — 5 enterprise management domains still in the official CLI's issue backlog.

### Gap vs Official CLI

**All 6 original gaps resolved:** ~~Full email system~~ — added (send/list/draft/folder). ~~Event WebSocket subscriptions~~ — added (`feishu event subscribe`). ~~Whiteboard rendering~~ — added (Mermaid workflow). ~~Interactive OAuth login~~ — added (`feishu auth login`). ~~Task subtasks and reminders~~ — added. ~~Document media insertion~~ — added (upload-image/upload-file).

## 164 Endpoints, by Scenario

🔄 **Office Automation** — Search/write/create docs, insert images/files into docs, update bitable (batch ops/field/view management), create approvals, manage tasks/subtasks. Markdown auto-converts to Feishu Block format.

💬 **IM & Collaboration** — Send/reply/forward/recall messages, read receipts, reactions, pins, merge-forward, urgent notifications (app/SMS/phone). Group management: create/update/members/announcements/search/share links.

📅 **Calendar & Meetings** — List events, create events, check freebusy, manage attendees, RSVP, expand recurring events, reserve video conferences, fetch meeting minutes.

📧 **Email System** — Send emails, list inbox, email details, create/send/delete drafts, folder management. Requires `--as user` identity.

📊 **Enterprise Management** — OKR (list/details/periods), attendance (records/stats/shifts), report rules, audit logs, department and user stats, contacts, enterprise glossary.

🔔 **Real-time Events** — `feishu event subscribe` for WebSocket event stream, NDJSON output, auto-reconnect. Agent can run as background subprocess.

## Framework-Agnostic

Official Feishu MCP is locked to MCP protocol. Official CLI is locked to npx skills framework. Switch Agents, switch tools.

This project locks to nothing — Claude Code, Gemini CLI, Codex, Cursor, custom Agents, even a bash script. Symlink `skill/` into your Agent's skill loading path, or feed SKILL.md directly as part of the system prompt.

## Quick Start

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install && npm run build && npm link
```

Configure your Feishu connection (pick one or both):

```bash
# Option 1: Personal MCP (zero approval, generate URL at https://open.feishu.cn/page/mcp/)
feishu config set-mcp --name contacts --url "YOUR_MCP_URL"
feishu config set-mcp --name im --url "YOUR_MCP_URL"
# ... add more as needed (see skill/references/setup.md)

# Option 2: App Direct (create app at https://open.feishu.cn, requires admin approval)
feishu config set --app-id <app_id> --app-secret <app_secret>
```

Register as an AI Skill (pick your Agent):

```bash
# Claude Code
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Gemini CLI
ln -sf "$(pwd)/skill" ~/.gemini/skills/feishu

# Other Agents — symlink skill/ into your Agent's skill loading path,
# or feed skill/SKILL.md directly as part of the system prompt.
```

Once registered, mentioning "Feishu" or "Lark" in any AI session auto-triggers the skill. Works with any Agent that can run shell commands.

## Three Identity Modes

| Mode | Command | Behavior |
|------|---------|----------|
| **auto** (default) | `feishu ...` | Bot REST first, auto-fallback to personal MCP on permission errors |
| user | `feishu --as user ...` | User REST first, fallback to MCP |
| bot | `feishu --as bot ...` | Bot REST only, no fallback |

```bash
feishu task list                                   # auto: bot 403 → auto MCP fallback
feishu --as user calendar list-events <calId>      # User identity
feishu --as bot im send oc_xxx --content "Notice"  # Force bot
```

## Configuration

Two modes, usable independently or together (recommended).

### Personal MCP (zero approval, recommended first step)

Generate URLs at [Feishu MCP Config Page](https://open.feishu.cn/page/mcp/), then:

```bash
feishu config set-mcp --name contacts --url "https://open.feishu.cn/mcp/stream/mcp_YOUR_URL"
feishu config set-mcp --name im --url "https://open.feishu.cn/mcp/stream/mcp_YOUR_URL"
# ... add docx / bitable_wiki / calendar / task as needed
feishu config list-mcp                             # View configured endpoints
```

See `skill/references/setup.md` for detailed creation guide.

### App Direct (requires admin approval, supports bot and file upload)

```bash
feishu config set --app-id <id> --app-secret <secret>
feishu auth login                                  # Optional: OAuth for user token
feishu config show
```

## Output Format

```
Success → stdout: {"data": {...}}
Error   → stderr: {"error": "...", "code": "..."}
```

## Workflow Templates

Three built-in multi-step workflow templates (`skill/references/workflows.md`):

- **Meeting Summary** — calendar → VC meetings → minutes → structured report
- **Standup Report** — calendar + tasks → daily summary
- **Diagram to Document** — Mermaid → PNG → upload-image → block create (install mermaid-cli on demand)

## Development

```bash
npm run dev       # Watch mode
npm test          # 58 tests
npm run build     # Build
```

## License

MIT
