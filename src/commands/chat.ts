import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerChatCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const chat = program.command('chat').description('Chat (group) management operations')

  chat
    .command('list')
    .description('List chats the bot is in')
    .option('--page-size <n>', 'Page size (max 100)', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('im_v1_chat_list', {
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_LIST_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('info')
    .description('Get chat (group) info')
    .argument('<chatId>', 'Chat ID')
    .action(async (chatId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_chat_get', {
          path: { chat_id: chatId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_INFO_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('create')
    .description('Create a new chat (group)')
    .requiredOption('--name <name>', 'Chat name')
    .option('--description <text>', 'Chat description')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const body: Record<string, string> = { name: opts.name }
        if (opts.description) body.description = opts.description
        const result = await svc.callTool('im_v1_chat_create', {
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_CREATE_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('members')
    .description('List members of a chat')
    .argument('<chatId>', 'Chat ID')
    .option('--page-size <n>', 'Page size (max 100)', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('im_v1_chat_members', {
          path: { chat_id: chatId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_MEMBERS_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('add-members')
    .description('Add members to a chat')
    .argument('<chatId>', 'Chat ID')
    .requiredOption('--id-list <ids...>', 'User IDs to add (space-separated)')
    .option('--member-type <type>', 'Member ID type: open_id, user_id, union_id, app_id', 'open_id')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_chat_members_create', {
          path: { chat_id: chatId },
          query: { member_id_type: opts.memberType },
          body: { id_list: opts.idList },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_ADD_MEMBERS_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('remove-members')
    .description('Remove members from a chat')
    .argument('<chatId>', 'Chat ID')
    .requiredOption('--id-list <ids...>', 'User IDs to remove (space-separated)')
    .option('--member-type <type>', 'Member ID type: open_id, user_id, union_id, app_id', 'open_id')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_chat_members_delete', {
          path: { chat_id: chatId },
          query: { member_id_type: opts.memberType },
          body: { id_list: opts.idList },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_REMOVE_MEMBERS_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('get-announcement')
    .description('Get chat announcement')
    .argument('<chatId>', 'Chat ID')
    .action(async (chatId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_chat_announcement_get', {
          path: { chat_id: chatId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_GET_ANNOUNCEMENT_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('set-announcement')
    .description('Set or update chat announcement')
    .argument('<chatId>', 'Chat ID')
    .requiredOption('--content <text>', 'Announcement content (supports markdown-like format)')
    .option('--revision <rev>', 'Revision for concurrency control (from get-announcement)')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, string> = { content: opts.content }
        if (opts.revision) body.revision = opts.revision
        const result = await svc.callTool('im_v1_chat_announcement_patch', {
          path: { chat_id: chatId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_SET_ANNOUNCEMENT_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('update')
    .description('Update chat properties')
    .argument('<chatId>', 'Chat ID')
    .option('--name <name>', 'New chat name')
    .option('--description <text>', 'New description')
    .option('--icon <key>', 'New icon key')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, string> = {}
        if (opts.name) body.name = opts.name
        if (opts.description) body.description = opts.description
        if (opts.icon) body.icon = opts.icon
        if (Object.keys(body).length === 0) {
          outputError('Provide at least one option: --name, --description, or --icon', 'CHAT_UPDATE_NO_FIELDS')
          process.exit(1)
        }
        const result = await svc.callTool('im_v1_chat_update', {
          path: { chat_id: chatId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_UPDATE_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('link')
    .description('Get chat share link')
    .argument('<chatId>', 'Chat ID')
    .action(async (chatId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_chat_link', {
          path: { chat_id: chatId },
          body: {},
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_LINK_ERROR')
        process.exit(1)
      }
    })

  chat
    .command('search')
    .description('Search chats by keyword')
    .argument('<query>', 'Search keyword')
    .option('--page-size <n>', 'Page size (max 100)', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (query: string, opts) => {
      try {
        const svc = await getService()
        const queryParams: Record<string, string> = { query, page_size: opts.pageSize }
        if (opts.pageToken) queryParams.page_token = opts.pageToken
        const result = await svc.callTool('im_v1_chat_search', {
          query: queryParams,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CHAT_SEARCH_ERROR')
        process.exit(1)
      }
    })
}
