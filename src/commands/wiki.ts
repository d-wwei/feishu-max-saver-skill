import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

/** Extract wiki token from a feishu/larksuite URL, or return as-is if already a token */
export function extractWikiToken(urlOrToken: string): string {
  const match = urlOrToken.match(/\/wiki\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : urlOrToken
}

export function registerWikiCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const wiki = program.command('wiki').description('Wiki operations')

  wiki
    .command('get')
    .description('Get wiki node info')
    .argument('<token>', 'Wiki node token or document token')
    .option('--type <type>', 'Object type: doc,docx,sheet,mindnote,bitable,file,slides,wiki', 'wiki')
    .action(async (token: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('wiki_v2_space_getNode', {
          query: { token, obj_type: opts.type },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'WIKI_GET_ERROR')
        process.exit(1)
      }
    })

  wiki
    .command('search')
    .description('Search wiki pages')
    .argument('<keyword>', 'Search keyword')
    .option('--count <n>', 'Number of results (max 50)', '10')
    .action(async (keyword: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('docx_builtin_search', {
          search_key: keyword,
          count: parseInt(opts.count),
          docs_types: ['wiki'],
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'WIKI_SEARCH_ERROR')
        process.exit(1)
      }
    })

  wiki
    .command('convert')
    .description('Convert wiki URL/token to document ID')
    .argument('<urlOrToken>', 'Wiki URL or token')
    .action(async (urlOrToken: string) => {
      try {
        const token = extractWikiToken(urlOrToken)
        const svc = await getService()
        const result = await svc.callTool('wiki_v2_space_getNode', {
          query: { token, obj_type: 'wiki' },
        }) as { node?: { obj_token?: string; obj_type?: string; title?: string } }
        const node = result?.node
        if (!node?.obj_token) {
          outputError('Could not resolve document ID from wiki token', 'WIKI_CONVERT_ERROR')
          process.exit(1)
        }
        outputSuccess({
          document_id: node.obj_token,
          obj_type: node.obj_type,
          title: node.title,
          wiki_token: token,
        })
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'WIKI_CONVERT_ERROR')
        process.exit(1)
      }
    })
}
