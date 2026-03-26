import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerReportCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const report = program.command('report').description('Report (汇报) operations')

  report
    .command('list-rules')
    .description('List report rules (templates)')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('report_v1_rule_query', {
          query,
          body: {},
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'REPORT_LIST_RULES_ERROR')
        process.exit(1)
      }
    })

  report
    .command('list-tasks')
    .description('List report tasks assigned to the user')
    .requiredOption('--rule-id <id>', 'Report rule ID')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('report_v1_task_query', {
          query,
          body: { rule_id: opts.ruleId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'REPORT_LIST_TASKS_ERROR')
        process.exit(1)
      }
    })
}
