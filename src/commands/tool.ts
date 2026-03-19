import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerToolCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const tool = program.command('tool').description('Call any remote MCP tool directly')

  tool
    .command('list')
    .description('List all available remote tools')
    .action(async () => {
      try {
        const svc = await getService()
        const tools = await svc.listTools()
        outputSuccess(tools)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TOOL_LIST_ERROR')
        process.exit(1)
      }
    })

  tool
    .command('call')
    .description('Call a remote tool by name')
    .argument('<name>', 'Tool name (e.g. docx_builtin_search)')
    .argument('<args>', 'Tool arguments as JSON string')
    .action(async (name: string, argsJson: string) => {
      try {
        let args: Record<string, unknown>
        try {
          args = JSON.parse(argsJson)
        } catch {
          outputError(`Invalid JSON: ${argsJson}`, 'INVALID_JSON')
          process.exit(1)
        }
        const svc = await getService()
        const result = await svc.callTool(name, args)
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TOOL_CALL_ERROR')
        process.exit(1)
      }
    })
}
