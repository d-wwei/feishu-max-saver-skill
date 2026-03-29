#!/usr/bin/env node
import { Command } from 'commander'
import { registerConfigCommand } from './commands/config.js'
import { registerDocCommand } from './commands/doc.js'
import { registerWikiCommand } from './commands/wiki.js'
import { registerToolCommand } from './commands/tool.js'
import { registerBlockCommand } from './commands/block.js'
import { registerFolderCommand } from './commands/folder.js'
import { registerImCommand } from './commands/im.js'
import { registerBitableCommand } from './commands/bitable.js'
import { registerCalendarCommand } from './commands/calendar.js'
import { registerCommentCommand } from './commands/comment.js'
import { registerSearchCommand } from './commands/search.js'
import { registerChatCommand } from './commands/chat.js'
import { registerContactCommand } from './commands/contact.js'
import { registerTaskCommand } from './commands/task.js'
import { registerApprovalCommand } from './commands/approval.js'
import { registerSheetsCommand } from './commands/sheets.js'
import { registerReportCommand } from './commands/report.js'
import { registerTenantCommand } from './commands/tenant.js'
import { registerMinutesCommand } from './commands/minutes.js'
import { registerVcCommand } from './commands/vc.js'
import { registerPermissionCommand } from './commands/permission.js'
import { registerMailCommand } from './commands/mail.js'
import { registerLingoCommand } from './commands/lingo.js'
import { registerOkrCommand } from './commands/okr.js'
import { registerAttendanceCommand } from './commands/attendance.js'
import { registerAdminCommand } from './commands/admin.js'
import { outputError } from './output.js'
import { readConfig } from './config.js'
import { initService, type FeishuService } from './service.js'

const program = new Command()
  .name('feishu')
  .description('Feishu CLI — direct MCP connection for AI consumption')
  .version('0.2.0')
  .option('--as <identity>', 'Run as user or bot identity', 'bot')

// Config command (no auth needed)
registerConfigCommand(program)

// Lazy service initializer
let _service: FeishuService | null = null
async function getService(): Promise<FeishuService> {
  if (_service) return _service
  const config = readConfig()
  if (!config) {
    outputError('No configuration found. Run: feishu config set --help', 'CONFIG_NOT_FOUND')
    process.exit(2)
  }
  const identity = (program.opts().as as 'user' | 'bot') || 'bot'
  _service = await initService(config, identity)
  return _service
}

registerDocCommand(program, getService)
registerWikiCommand(program, getService)
registerBlockCommand(program, getService)
registerFolderCommand(program, getService)
registerImCommand(program, getService)
registerBitableCommand(program, getService)
registerCalendarCommand(program, getService)
registerCommentCommand(program, getService)
registerSearchCommand(program, getService)
registerChatCommand(program, getService)
registerContactCommand(program, getService)
registerTaskCommand(program, getService)
registerApprovalCommand(program, getService)
registerSheetsCommand(program, getService)
registerReportCommand(program, getService)
registerTenantCommand(program, getService)
registerMinutesCommand(program, getService)
registerVcCommand(program, getService)
registerPermissionCommand(program, getService)
registerMailCommand(program, getService)
registerLingoCommand(program, getService)
registerOkrCommand(program, getService)
registerAttendanceCommand(program, getService)
registerAdminCommand(program, getService)
registerToolCommand(program, getService)

program.parseAsync(process.argv).catch((err) => {
  outputError(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
