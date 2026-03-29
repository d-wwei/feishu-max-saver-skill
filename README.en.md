<p align="center">
  <h1 align="center">Feishu Max Saver Skill</h1>
  <p align="center">125 Feishu APIs. 655 tokens of context. Works with any Agent.</p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> · <a href="#why-not-the-official-options">Why Not Official</a> · <a href="./README.md">中文</a>
  </p>
</p>

---

## What Is This

A full-platform Feishu/Lark CLI built for AI Agents. 125 REST API endpoints, 29 capability categories, dual identity mode.

```bash
feishu doc search "Q2 report"                    # Search docs
feishu im send oc_xxx --content "Deploy done"    # Send message
feishu bitable search-records app_xxx tbl_xxx    # Query bitable
feishu calendar freebusy --start ... --end ...   # Check availability
feishu tool call <any_api_name> '<json>'         # Call any of 125 endpoints
```

All output is structured JSON. Agent-ready.

## Why Not the Official Options

| Approach | Context Cost | Agent Compatibility | Loading |
|----------|-------------|-------------------|---------|
| Official Feishu MCP (1350+ tools) | ~15,000+ tokens | MCP clients only | Full load at startup |
| Official Lark CLI (19 skill files) | ~15,000+ tokens | npx skills only | Full load at startup |
| **This project** | **~655 tokens** | **Any Agent** | **On-demand** |

655 vs 15,000 — 96% less context. For an Agent, saved context is extra room to think.

**Two-tier loading:** SKILL.md (~655 tokens) stays resident. The full command reference (~3,600 tokens) loads only when specific parameters are needed. Most tasks never need the second tier.

### Capabilities the Official CLI Doesn't Have

Approval workflows, OKR, attendance records, report rules, admin console (audit logs, stats) — 5 enterprise management domains still in the official CLI's backlog.

## 29 Capability Categories

**Docs & Knowledge** — doc (search/read/write/create/delete), block (CRUD), folder, wiki, comment, permission, search

**IM & Collaboration** — im (send/reply/forward/recall/read-status/reactions/pins/merge-forward/urgent), chat (create/update/members/announcements/search/share-link)

**Data & Tables** — bitable (CRUD/batch ops/field management/view management), sheets (read/write/append)

**Calendar & Meetings** — calendar (event CRUD/search/RSVP/attendee management/freebusy/recurring instances), vc (reserve/query), minutes (transcription/stats)

**Enterprise Management** — task, approval, okr, attendance, report, contact, mail, lingo, tenant, admin

**Escape hatch** — `feishu tool call <api_name> '<json>'` calls any of the 125 mapped endpoints directly

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
