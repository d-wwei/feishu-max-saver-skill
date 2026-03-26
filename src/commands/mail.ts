import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerMailCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const mail = program.command('mail').description('Mail (email) operations')

  mail
    .command('list-groups')
    .description('List mail groups')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('mail_v1_mailgroup_list', {
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_LIST_GROUPS_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('get-group')
    .description('Get mail group details')
    .argument('<mailgroupId>', 'Mail group ID')
    .action(async (mailgroupId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_mailgroup_get', {
          path: { mailgroup_id: mailgroupId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_GET_GROUP_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('list-group-members')
    .description('List mail group members')
    .argument('<mailgroupId>', 'Mail group ID')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (mailgroupId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('mail_v1_mailgroup_member_list', {
          path: { mailgroup_id: mailgroupId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_LIST_GROUP_MEMBERS_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('list-public-mailboxes')
    .description('List public mailboxes')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('mail_v1_public_mailbox_list', {
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_LIST_PUBLIC_MAILBOXES_ERROR')
        process.exit(1)
      }
    })
}
