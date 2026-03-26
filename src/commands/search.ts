import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerSearchCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const search = program.command('search').description('Unified search operations')

  search
    .command('message')
    .description('Search messages')
    .argument('<keyword>', 'Search keyword')
    .option('--page-size <n>', 'Number of results per page')
    .option('--chat-id <chatId>', 'Filter by chat ID')
    .action(async (keyword: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = { query: keyword }
        if (opts.pageSize) body.page_size = parseInt(opts.pageSize)
        if (opts.chatId) body.chat_id = opts.chatId
        const result = await svc.callTool('search_v2_message', {
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'SEARCH_MESSAGE_ERROR')
        process.exit(1)
      }
    })

  search
    .command('app')
    .description('Search applications')
    .argument('<keyword>', 'Search keyword')
    .option('--page-size <n>', 'Number of results per page')
    .action(async (keyword: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = { query: keyword }
        if (opts.pageSize) body.page_size = parseInt(opts.pageSize)
        const result = await svc.callTool('search_v2_app', {
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'SEARCH_APP_ERROR')
        process.exit(1)
      }
    })
}
