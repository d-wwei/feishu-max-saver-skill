import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerAttendanceCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const attendance = program.command('attendance').description('Attendance operations')

  attendance
    .command('query-tasks')
    .description('Query user punch/attendance tasks (records)')
    .requiredOption('--user-ids <ids...>', 'Array of user IDs')
    .requiredOption('--check-date-from <n>', 'Start date (YYYYMMDD)')
    .requiredOption('--check-date-to <n>', 'End date (YYYYMMDD)')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('attendance_v1_user_task_query', {
          body: {
            user_ids: opts.userIds,
            check_date_from: opts.checkDateFrom,
            check_date_to: opts.checkDateTo,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ATTENDANCE_QUERY_TASKS_ERROR')
        process.exit(1)
      }
    })

  attendance
    .command('query-stats')
    .description('Query attendance statistics data')
    .requiredOption('--user-ids <ids...>', 'Array of user IDs')
    .requiredOption('--start-date <date>', 'Start date (YYYYMMDD)')
    .requiredOption('--end-date <date>', 'End date (YYYYMMDD)')
    .option('--locale <locale>', 'Locale for results', 'zh')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('attendance_v1_user_stats_data_query', {
          body: {
            user_ids: opts.userIds,
            start_date: opts.startDate,
            end_date: opts.endDate,
            locale: opts.locale,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ATTENDANCE_QUERY_STATS_ERROR')
        process.exit(1)
      }
    })

  attendance
    .command('list-shifts')
    .description('List available shifts')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('attendance_v1_shift_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ATTENDANCE_LIST_SHIFTS_ERROR')
        process.exit(1)
      }
    })

  attendance
    .command('get-shift')
    .description('Get shift details')
    .argument('<shiftId>', 'Shift ID')
    .action(async (shiftId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('attendance_v1_shift_get', {
          path: { shift_id: shiftId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'ATTENDANCE_GET_SHIFT_ERROR')
        process.exit(1)
      }
    })
}
