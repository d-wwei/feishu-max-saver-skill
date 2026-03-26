import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerPermissionCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const permission = program.command('permission').description('Drive permission (document sharing) operations')

  permission
    .command('list')
    .description('List collaborators of a document')
    .argument('<token>', 'Document token')
    .option('--type <type>', 'Document type: doc, sheet, bitable, docx, file, wiki, folder', 'doc')
    .action(async (token: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_permission_member_list', {
          path: { token },
          query: { type: opts.type },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'PERMISSION_LIST_ERROR')
        process.exit(1)
      }
    })

  permission
    .command('add')
    .description('Add a collaborator to a document')
    .argument('<token>', 'Document token')
    .option('--type <type>', 'Document type: doc, sheet, bitable, docx, file, wiki, folder', 'doc')
    .requiredOption('--member-type <type>', 'Member type: openid, userid, email, chatid, departmentid')
    .requiredOption('--member-id <id>', 'Member ID')
    .requiredOption('--perm <perm>', 'Permission: view, edit, full_access')
    .action(async (token: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_permission_member_create', {
          path: { token },
          query: { type: opts.type },
          body: {
            member_type: opts.memberType,
            member_id: opts.memberId,
            perm: opts.perm,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'PERMISSION_ADD_ERROR')
        process.exit(1)
      }
    })

  permission
    .command('update')
    .description('Update collaborator permission')
    .argument('<token>', 'Document token')
    .argument('<memberId>', 'Member ID')
    .option('--type <type>', 'Document type: doc, sheet, bitable, docx, file, wiki, folder', 'doc')
    .requiredOption('--member-type <type>', 'Member type: openid, userid, email, chatid, departmentid')
    .requiredOption('--perm <perm>', 'Permission: view, edit, full_access')
    .action(async (token: string, memberId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_permission_member_update', {
          path: { token, member_id: memberId },
          query: { type: opts.type },
          body: {
            member_type: opts.memberType,
            perm: opts.perm,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'PERMISSION_UPDATE_ERROR')
        process.exit(1)
      }
    })

  permission
    .command('remove')
    .description('Remove a collaborator from a document')
    .argument('<token>', 'Document token')
    .argument('<memberId>', 'Member ID')
    .option('--type <type>', 'Document type: doc, sheet, bitable, docx, file, wiki, folder', 'doc')
    .requiredOption('--member-type <type>', 'Member type: openid, userid, email, chatid, departmentid')
    .action(async (token: string, memberId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_permission_member_delete', {
          path: { token, member_id: memberId },
          query: { type: opts.type, member_type: opts.memberType },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'PERMISSION_REMOVE_ERROR')
        process.exit(1)
      }
    })
}
