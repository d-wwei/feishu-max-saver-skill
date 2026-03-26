import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerLingoCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const lingo = program.command('lingo').description('Lingo (enterprise glossary/knowledge base) operations')

  lingo
    .command('search')
    .description('Search glossary entities')
    .argument('<query>', 'Search keyword')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (query: string, opts) => {
      try {
        const svc = await getService()
        const queryParams: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) queryParams.page_token = opts.pageToken
        const result = await svc.callTool('lingo_v1_entity_search', {
          query: queryParams,
          body: { query },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'LINGO_SEARCH_ERROR')
        process.exit(1)
      }
    })

  lingo
    .command('get')
    .description('Get entity details')
    .argument('<entityId>', 'Entity ID')
    .action(async (entityId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('lingo_v1_entity_get', {
          path: { entity_id: entityId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'LINGO_GET_ERROR')
        process.exit(1)
      }
    })

  lingo
    .command('list')
    .description('List all entities')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('lingo_v1_entity_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'LINGO_LIST_ERROR')
        process.exit(1)
      }
    })

  lingo
    .command('create')
    .description('Create a glossary entity')
    .requiredOption('--main-key <term>', 'The term name')
    .option('--description <text>', 'Entity description')
    .option('--aliases <names...>', 'Alias names for the term')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = {
          main_keys: [{ key: opts.mainKey, display_status: { allow_highlight: true, allow_search: true } }],
        }
        if (opts.description) body.description = opts.description
        if (opts.aliases) body.aliases = opts.aliases.map((a: string) => ({ key: a }))
        const result = await svc.callTool('lingo_v1_entity_create', { body })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'LINGO_CREATE_ERROR')
        process.exit(1)
      }
    })
}
