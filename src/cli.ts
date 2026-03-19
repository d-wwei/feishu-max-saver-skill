#!/usr/bin/env node
import { Command } from 'commander'
import { registerConfigCommand } from './commands/config.js'
import { registerDocCommand } from './commands/doc.js'
import { registerWikiCommand } from './commands/wiki.js'
import { registerToolCommand } from './commands/tool.js'
import { registerBlockCommand } from './commands/block.js'
import { registerFolderCommand } from './commands/folder.js'
import { outputError } from './output.js'
import { readConfig } from './config.js'
import { initService, type FeishuService } from './service.js'

const program = new Command()
  .name('feishu')
  .description('Feishu CLI — direct MCP connection for AI consumption')
  .version('0.2.0')

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
  _service = await initService(config)
  return _service
}

registerDocCommand(program, getService)
registerWikiCommand(program, getService)
registerBlockCommand(program, getService)
registerFolderCommand(program, getService)
registerToolCommand(program, getService)

program.parseAsync(process.argv).catch((err) => {
  outputError(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
