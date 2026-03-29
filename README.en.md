<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">134 Feishu APIs. 655 tokens of context. Works with any Agent.</p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> · <a href="#why-not-the-official-options">Why Not Official</a> · <a href="./README.md">中文</a>
  </p>
</p>

---

## What Is This

"Max Saver" is literal: **maximum context savings for AI Agents**.

Connecting an AI Agent to Feishu/Lark typically costs 15,000+ tokens of context window — burned on loading tool definitions before any real work begins. This project brings that number down to **655 tokens**. Same 134 API endpoints, same 29 capability categories, **4% of the context cost**.

```bash
feishu doc search "Q2 report"                    # Search docs
feishu im send oc_xxx --content "Deploy done"    # Send message
feishu bitable search-records app_xxx tbl_xxx    # Query bitable
feishu calendar freebusy --start ... --end ...   # Check availability
feishu tool call <any_api_name> '<json>'         # Call any of 125 endpoints
```

All output is structured JSON. Agent-ready. Framework-agnostic — if your Agent can run shell commands, it works.

## Why Not the Official Options

| Approach | Context Cost | Agent Compatibility | Loading |
|----------|-------------|-------------------|---------|
| Official Feishu MCP (1350+ tools) | ~15,000+ tokens | MCP clients only | Full load at startup |
| Official Lark CLI (19 skill files) | ~15,000+ tokens | npx skills only | Full load at startup |
| **This project** | **~655 tokens** | **Any Agent** | **On-demand** |

### How We Get to 655 Tokens

Three design decisions, stacked:

**1. Two-tier loading.** SKILL.md (~655 tokens) contains only the capability overview and common command patterns — it stays resident. The full 80+ command reference (~3,600 tokens) lives in `references/commands.md` and loads only when the Agent needs specific parameters. Most tasks never hit the second tier.

**2. CLI, not MCP.** MCP requires injecting JSON schemas for every tool into context at connection time. 1,350 tools = 1,350 schemas. This project takes the CLI route — the Agent runs `feishu <command>` directly. No schemas to preload.

**3. Skill protocol, not MCP protocol.** Skills are on-demand: SKILL.md loads when "Feishu" appears in conversation, unloads when done. MCP servers are persistent: loaded at startup regardless of whether this conversation needs Feishu at all.

Combined: 655 vs 15,000. 96% saved.

### What We Have That the Official CLI Doesn't

Approval workflows, OKR, attendance records, report rules, admin console (audit logs, stats) — 5 enterprise management domains still in the official CLI's issue backlog.

### What the Official CLI Has That We Don't

In the interest of transparency:

- **Full email system** — Official supports email CRUD (read/send/draft/reply/labels). We only have mailgroup queries.
- **Interactive OAuth login** — Official has an interactive OAuth flow. Our `--as user` mode requires manually pasting a token.
- **Event WebSocket subscriptions** — Official supports real-time event push via long-lived connections. We're a CLI tool, not a persistent service.
- **Whiteboard rendering** — Official supports Mermaid → Feishu whiteboard. We don't.

~~Task subtasks and reminders~~ — added (create-subtask / list-subtasks / --reminder / add-follower). ~~Document media insertion~~ — added (upload-image / upload-file).

Remaining gaps have limited impact on most Agent workflows. But if your use case depends heavily on email, the official CLI may be a better fit.

## 29 Capability Categories

**Docs & Knowledge** — doc (search/read/write/create/delete), block (CRUD), folder, wiki, comment, permission, search

**IM & Collaboration** — im (send/reply/forward/recall/read-status/reactions/pins/merge-forward/urgent), chat (create/update/members/announcements/search/share-link)

**Data & Tables** — bitable (CRUD/batch ops/field management/view management), sheets (read/write/append)

**Calendar & Meetings** — calendar (event CRUD/search/RSVP/attendee management/freebusy/recurring instances), vc (reserve/query), minutes (transcription/stats)

**Enterprise Management** — task, approval, okr, attendance, report, contact, mail, lingo, tenant, admin

**Escape hatch** — `feishu tool call <api_name> '<json>'` calls any of the 134 mapped endpoints directly

## Quick Start

```bash
git clone https://github.com/d-wwei/feishu-max-saver-skill.git
cd feishu-max-saver-skill
npm install && npm run build && npm link
```

Configure your Feishu app credentials (create an app on the [Feishu Open Platform](https://open.feishu.cn)):

```bash
feishu config set --app-id <app_id> --app-secret <app_secret>
```

Register as an AI Skill:

```bash
# macOS / Linux
ln -sf "$(pwd)/skill" ~/.claude/skills/feishu

# Windows (PowerShell, admin)
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.claude\skills\feishu" -Target "$(Get-Location)\skill"
```

Once registered, mentioning "Feishu" or "Lark" in any AI session auto-triggers the skill. Works with Claude Code, Gemini CLI, and any Agent supporting the Skill protocol.

## Dual Identity Mode

Default: bot identity. Add `--as user` to switch to user identity for personal calendars, tasks, and other user-scoped resources:

```bash
feishu calendar list-events <calId> --as user     # User identity
feishu config set --user-access-token <token>      # Set user token
```

## Configuration

```bash
# Direct mode (recommended)
feishu config set --app-id <id> --app-secret <secret>

# Proxy mode
feishu config set --url <Feishu MCP endpoint URL>

# View current config
feishu config show
```

## Output Format

```
Success → stdout: {"data": {...}}
Error   → stderr: {"error": "...", "code": "..."}
```

## Workflow Templates

Two built-in multi-step workflow templates (`skill/references/workflows.md`):

- **Meeting Summary** — calendar → VC meetings → minutes → structured report
- **Standup Report** — calendar + tasks → daily summary

## Development

```bash
npm run dev       # Watch mode
npm test          # 58 tests
npm run build     # Build
```

## License

MIT
