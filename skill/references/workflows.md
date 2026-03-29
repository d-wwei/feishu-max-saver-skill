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

---

## Diagram to Document (图表插入文档)

**Trigger:** "画个流程图" / "插入图表" / "add diagram" / "insert chart"

### Prerequisites

用户需安装 mermaid-cli（仅首次）：
```
npm install -g @mermaid-js/mermaid-cli
```

### Steps

1. Agent 生成 Mermaid 语法，写入临时文件：
   ```bash
   cat > /tmp/diagram.mmd << 'EOF'
   graph LR
     A[用户请求] --> B[Agent 处理]
     B --> C[调用飞书 API]
     C --> D[返回结果]
   EOF
   ```

2. 渲染为 PNG：
   ```bash
   mmdc -i /tmp/diagram.mmd -o /tmp/diagram.png -b transparent
   ```

3. 上传图片到飞书，拿到 file_token：
   ```bash
   feishu doc upload-image /tmp/diagram.png --parent <docToken>
   # → {"data": {"file_token": "boxcnXXX"}}
   ```

4. 在文档中插入图片 block：
   ```bash
   feishu block create <docId> <parentBlockId> --body '{"block_type":27,"image":{"token":"boxcnXXX"}}'
   ```

5. 清理临时文件：
   ```bash
   rm /tmp/diagram.mmd /tmp/diagram.png
   ```

### Notes
- 支持所有 Mermaid 图表类型：flowchart、sequence、gantt、pie、mindmap 等
- 如果 mermaid-cli 未安装，提示用户运行 `npm install -g @mermaid-js/mermaid-cli`
- 也可以用其他渲染工具（D2、PlantUML），只要输出 PNG/SVG 即可
- SVG 需先转为 PNG 再上传（飞书图片 block 不支持 SVG）
