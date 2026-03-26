import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerContactCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const contact = program.command('contact').description('Contact (address book) operations')

  contact
    .command('get-user')
    .description('Get user info')
    .argument('<userId>', 'User ID')
    .option('--id-type <type>', 'ID type: open_id, union_id, user_id', 'open_id')
    .action(async (userId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('contact_v3_user_get', {
          path: { user_id: userId },
          query: { user_id_type: opts.idType },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CONTACT_GET_USER_ERROR')
        process.exit(1)
      }
    })

  contact
    .command('search-user')
    .description('Search users by keyword')
    .argument('<keyword>', 'Search keyword')
    .option('--page-size <n>', 'Page size (max 50)', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (keyword: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = {
          user_id_type: 'open_id',
          page_size: opts.pageSize,
        }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('contact_v3_user_search', {
          query,
          body: { query: keyword },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CONTACT_SEARCH_USER_ERROR')
        process.exit(1)
      }
    })

  contact
    .command('get-dept')
    .description('Get department info')
    .argument('<deptId>', 'Department ID')
    .action(async (deptId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('contact_v3_department_get', {
          path: { department_id: deptId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CONTACT_GET_DEPT_ERROR')
        process.exit(1)
      }
    })

  contact
    .command('list-dept')
    .description('List sub-departments')
    .option('--parent-id <id>', 'Parent department ID (0 for root)', '0')
    .option('--page-size <n>', 'Page size (max 100)', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = {
          parent_department_id: opts.parentId,
          page_size: opts.pageSize,
        }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('contact_v3_department_list', {
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CONTACT_LIST_DEPT_ERROR')
        process.exit(1)
      }
    })
}
