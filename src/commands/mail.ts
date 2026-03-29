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

  // --- User Mailbox (requires --as user) ---

  mail
    .command('send')
    .description('Send an email')
    .argument('<mailboxId>', 'Mailbox ID (use "me" for current user)')
    .requiredOption('--to <addresses>', 'Recipient email addresses (comma-separated)')
    .requiredOption('--subject <text>', 'Email subject')
    .requiredOption('--body <html>', 'Email body (HTML)')
    .option('--cc <addresses>', 'CC addresses (comma-separated)')
    .option('--bcc <addresses>', 'BCC addresses (comma-separated)')
    .action(async (mailboxId: string, opts) => {
      try {
        const svc = await getService()
        const toList = opts.to.split(',').map((a: string) => ({ mail_address: a.trim() }))
        const body: Record<string, unknown> = {
          to: toList,
          subject: opts.subject,
          body_html: opts.body,
        }
        if (opts.cc) body.cc = opts.cc.split(',').map((a: string) => ({ mail_address: a.trim() }))
        if (opts.bcc) body.bcc = opts.bcc.split(',').map((a: string) => ({ mail_address: a.trim() }))
        const result = await svc.callTool('mail_v1_user_mailbox_message_send', {
          path: { user_mailbox_id: mailboxId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_SEND_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('list-messages')
    .description('List emails in a mailbox')
    .argument('<mailboxId>', 'Mailbox ID (use "me" for current user)')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (mailboxId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('mail_v1_user_mailbox_message_list', {
          path: { user_mailbox_id: mailboxId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_LIST_MESSAGES_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('get-message')
    .description('Get email details')
    .argument('<mailboxId>', 'Mailbox ID')
    .argument('<messageId>', 'Message ID')
    .action(async (mailboxId: string, messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_user_mailbox_message_get', {
          path: { user_mailbox_id: mailboxId, message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_GET_MESSAGE_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('delete-message')
    .description('Delete an email')
    .argument('<mailboxId>', 'Mailbox ID')
    .argument('<messageId>', 'Message ID')
    .action(async (mailboxId: string, messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_user_mailbox_message_delete', {
          path: { user_mailbox_id: mailboxId, message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_DELETE_MESSAGE_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('create-draft')
    .description('Create an email draft')
    .argument('<mailboxId>', 'Mailbox ID')
    .requiredOption('--to <addresses>', 'Recipient email addresses (comma-separated)')
    .requiredOption('--subject <text>', 'Email subject')
    .requiredOption('--body <html>', 'Email body (HTML)')
    .option('--cc <addresses>', 'CC addresses (comma-separated)')
    .action(async (mailboxId: string, opts) => {
      try {
        const svc = await getService()
        const toList = opts.to.split(',').map((a: string) => ({ mail_address: a.trim() }))
        const body: Record<string, unknown> = {
          to: toList,
          subject: opts.subject,
          body_html: opts.body,
        }
        if (opts.cc) body.cc = opts.cc.split(',').map((a: string) => ({ mail_address: a.trim() }))
        const result = await svc.callTool('mail_v1_user_mailbox_draft_create', {
          path: { user_mailbox_id: mailboxId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_CREATE_DRAFT_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('send-draft')
    .description('Send a saved draft')
    .argument('<mailboxId>', 'Mailbox ID')
    .argument('<draftId>', 'Draft ID')
    .action(async (mailboxId: string, draftId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_user_mailbox_draft_send', {
          path: { user_mailbox_id: mailboxId, draft_id: draftId },
          body: {},
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_SEND_DRAFT_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('delete-draft')
    .description('Delete a draft')
    .argument('<mailboxId>', 'Mailbox ID')
    .argument('<draftId>', 'Draft ID')
    .action(async (mailboxId: string, draftId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_user_mailbox_draft_delete', {
          path: { user_mailbox_id: mailboxId, draft_id: draftId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_DELETE_DRAFT_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('list-folders')
    .description('List mailbox folders')
    .argument('<mailboxId>', 'Mailbox ID')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (mailboxId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('mail_v1_user_mailbox_folder_list', {
          path: { user_mailbox_id: mailboxId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_LIST_FOLDERS_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('create-folder')
    .description('Create a mailbox folder')
    .argument('<mailboxId>', 'Mailbox ID')
    .requiredOption('--name <name>', 'Folder name')
    .action(async (mailboxId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_user_mailbox_folder_create', {
          path: { user_mailbox_id: mailboxId },
          body: { name: opts.name },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_CREATE_FOLDER_ERROR')
        process.exit(1)
      }
    })

  mail
    .command('delete-folder')
    .description('Delete a mailbox folder')
    .argument('<mailboxId>', 'Mailbox ID')
    .argument('<folderId>', 'Folder ID')
    .action(async (mailboxId: string, folderId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('mail_v1_user_mailbox_folder_delete', {
          path: { user_mailbox_id: mailboxId, folder_id: folderId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MAIL_DELETE_FOLDER_ERROR')
        process.exit(1)
      }
    })
}
