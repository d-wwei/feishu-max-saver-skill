# Workflow Templates

Multi-step workflows composed from existing feishu CLI commands. AI agent reads these steps and executes them sequentially.

## Meeting Summary (会议纪要汇总)

**Trigger:** "总结会议" / "会议纪要" / "summarize meetings"

### Steps

1. Get primary calendar:
   ```
   feishu calendar list
   ```
   Pick the primary calendar ID from the result.

2. List today's (or specified range) events:
   ```
   feishu calendar list-events <calendarId> --start <YYYY-MM-DDT00:00:00+08:00> --end <YYYY-MM-DDT23:59:59+08:00>
   ```

3. For each VC meeting (has meeting_no), get meeting details:
   ```
   feishu vc list-by-no <meetingNo>
   ```

4. If the meeting has minutes (minute_token), fetch transcription:
   ```
   feishu minutes get <minuteToken>
   ```

5. Organize results into a structured report:
   ```markdown
   # Meeting Summary — YYYY-MM-DD

   ## 1. [Meeting Title] (HH:MM - HH:MM)
   - Organizer: xxx
   - Attendees: xxx, xxx
   - Key Points:
     - ...
   - Action Items:
     - [ ] ...

   ## 2. [Next Meeting] ...
   ```

6. (Optional) Write report to a Feishu doc:
   ```
   feishu doc create --title "Meeting Summary YYYY-MM-DD"
   feishu doc write <docId> --content '<markdown report>'
   ```

### Notes
- Use `--as user` if calendar access requires user identity
- Maximum 1-month range per calendar query; split longer periods
- Minutes API requires `minutes:minutes:readonly` permission

---

## Standup Report (站会日报)

**Trigger:** "站会报告" / "日报" / "daily standup" / "today's agenda"

### Steps

1. Get primary calendar:
   ```
   feishu calendar list
   ```

2. List today's events:
   ```
   feishu calendar list-events <calendarId> --start <today-start> --end <today-end>
   ```

3. List pending tasks:
   ```
   feishu task list
   ```

4. Combine into structured standup format:
   ```markdown
   # Standup — YYYY-MM-DD (Day of Week)

   ## Today's Schedule
   | Time | Event | Organizer |
   |------|-------|-----------|
   | 09:00-09:30 | Team Standup | Manager |
   | 14:00-15:00 | Project Review | Lead |

   ## Pending Tasks
   - [ ] Complete project documentation (Due: 2026-03-30)
   - [ ] Review team PRs (No due date)

   ## Blockers
   - (Ask user or infer from overdue tasks)
   ```

5. (Optional) Send summary to a chat:
   ```
   feishu im send <chatId> --content '<summary text>'
   ```

### Notes
- Use `--as user` for personal calendar and task access
- Calendar times are RFC3339 format
- Tasks API returns incomplete tasks by default
