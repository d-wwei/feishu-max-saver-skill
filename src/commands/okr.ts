import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerOkrCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const okr = program.command('okr').description('OKR (Objectives and Key Results) operations')

  okr
    .command('list')
    .description("List user's OKRs")
    .argument('<userId>', 'User open_id')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .option('--lang <lang>', 'Language', 'zh_cn')
    .action(async (userId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = {
          page_size: opts.pageSize,
          lang: opts.lang,
          user_id_type: 'open_id',
        }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('okr_v1_user_okr_list', {
          path: { user_id: userId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'OKR_LIST_ERROR')
        process.exit(1)
      }
    })

  okr
    .command('get')
    .description('Get OKR details')
    .argument('<okrId>', 'OKR ID')
    .option('--lang <lang>', 'Language', 'zh_cn')
    .action(async (okrId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('okr_v1_okr_get', {
          path: { okr_id: okrId },
          query: { lang: opts.lang },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'OKR_GET_ERROR')
        process.exit(1)
      }
    })

  okr
    .command('periods')
    .description('List OKR periods')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('okr_v1_period_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'OKR_PERIODS_ERROR')
        process.exit(1)
      }
    })
}
