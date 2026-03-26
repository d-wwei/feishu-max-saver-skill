import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerAdminCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const admin = program.command('admin').description('Admin and audit operations')

  admin
    .command('audit-logs')
    .description('Get audit logs')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .option('--latest <n>', 'Latest N days', '1')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = {
          page_size: opts.pageSize,
          latest: opts.latest,
        }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('admin_v1_audit_info_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ADMIN_AUDIT_LOGS_ERROR')
        process.exit(1)
      }
    })

  admin
    .command('department-stats')
    .description('Get department statistics')
    .requiredOption('--department-id <id>', 'Department ID')
    .requiredOption('--start-date <date>', 'Start date (YYYYMMDD)')
    .requiredOption('--end-date <date>', 'End date (YYYYMMDD)')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = {
          department_id: opts.departmentId,
          start_date: opts.startDate,
          end_date: opts.endDate,
          page_size: opts.pageSize,
        }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('admin_v1_admin_dept_stat_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ADMIN_DEPT_STATS_ERROR')
        process.exit(1)
      }
    })

  admin
    .command('user-stats')
    .description('Get user activity statistics')
    .requiredOption('--department-id <id>', 'Department ID')
    .requiredOption('--start-date <date>', 'Start date (YYYYMMDD)')
    .requiredOption('--end-date <date>', 'End date (YYYYMMDD)')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = {
          department_id: opts.departmentId,
          start_date: opts.startDate,
          end_date: opts.endDate,
          page_size: opts.pageSize,
        }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('admin_v1_admin_user_stat_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ADMIN_USER_STATS_ERROR')
        process.exit(1)
      }
    })
}
