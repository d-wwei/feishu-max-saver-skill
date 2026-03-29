import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerImCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const im = program.command('im').description('IM message operations')

  im
    .command('send')
    .description('Send a message to a chat')
    .argument('<receiveId>', 'Chat ID or user open_id')
    .requiredOption('--content <text>', 'Message text content')
    .option('--type <type>', 'Message type: text, interactive, post', 'text')
    .option('--receive-type <type>', 'Receive ID type: open_id, user_id, union_id, email, chat_id', 'chat_id')
    .action(async (receiveId: string, opts) => {
      try {
        const svc = await getService()
        let content: string
        if (opts.type === 'text') {
          content = JSON.stringify({ text: opts.content })
        } else {
          content = opts.content
        }
        const result = await svc.callTool('im_v1_message_create', {
          query: { receive_id_type: opts.receiveType },
          body: {
            receive_id: receiveId,
            msg_type: opts.type,
            content,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_SEND_ERROR')
        process.exit(1)
      }
    })

  im
    .command('reply')
    .description('Reply to a message')
    .argument('<messageId>', 'Message ID to reply to')
    .requiredOption('--content <text>', 'Reply text content')
    .option('--type <type>', 'Message type: text, interactive, post', 'text')
    .action(async (messageId: string, opts) => {
      try {
        const svc = await getService()
        let content: string
        if (opts.type === 'text') {
          content = JSON.stringify({ text: opts.content })
        } else {
          content = opts.content
        }
        const result = await svc.callTool('im_v1_message_reply', {
          path: { message_id: messageId },
          body: {
            msg_type: opts.type,
            content,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_REPLY_ERROR')
        process.exit(1)
      }
    })

  im
    .command('list')
    .description('List messages in a chat')
    .argument('<chatId>', 'Chat ID (container_id)')
    .option('--count <n>', 'Number of messages to retrieve (max 50)', '20')
    .option('--sort <order>', 'Sort order: ByCreateTimeAsc or ByCreateTimeDesc', 'ByCreateTimeDesc')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_list', {
          query: {
            container_id_type: 'chat',
            container_id: chatId,
            page_size: opts.count,
            sort_type: opts.sort,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_LIST_ERROR')
        process.exit(1)
      }
    })

  im
    .command('get')
    .description('Get a specific message')
    .argument('<messageId>', 'Message ID')
    .action(async (messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_get', {
          path: { message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_GET_ERROR')
        process.exit(1)
      }
    })

  im
    .command('forward')
    .description('Forward a message to another chat')
    .argument('<messageId>', 'Message ID to forward')
    .requiredOption('--receive-id <id>', 'Target chat ID or user open_id')
    .option('--receive-type <type>', 'Receive ID type: open_id, user_id, union_id, email, chat_id', 'chat_id')
    .action(async (messageId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_forward', {
          path: { message_id: messageId },
          query: { receive_id_type: opts.receiveType },
          body: { receive_id: opts.receiveId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_FORWARD_ERROR')
        process.exit(1)
      }
    })

  im
    .command('delete')
    .description('Recall (delete) a message')
    .argument('<messageId>', 'Message ID to recall')
    .action(async (messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_delete', {
          path: { message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_DELETE_ERROR')
        process.exit(1)
      }
    })

  im
    .command('send-image')
    .description('Send an image message (provide image_key from uploaded image)')
    .argument('<receiveId>', 'Chat ID or user open_id')
    .requiredOption('--image-key <key>', 'Image key from feishu image upload')
    .option('--receive-type <type>', 'Receive ID type: open_id, user_id, union_id, email, chat_id', 'chat_id')
    .action(async (receiveId: string, opts) => {
      try {
        const svc = await getService()
        const content = JSON.stringify({ image_key: opts.imageKey })
        const result = await svc.callTool('im_v1_message_create', {
          query: { receive_id_type: opts.receiveType },
          body: {
            receive_id: receiveId,
            msg_type: 'image',
            content,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_SEND_IMAGE_ERROR')
        process.exit(1)
      }
    })

  im
    .command('send-file')
    .description('Send a file message (provide file_key from uploaded file)')
    .argument('<receiveId>', 'Chat ID or user open_id')
    .requiredOption('--file-key <key>', 'File key from feishu file upload')
    .option('--receive-type <type>', 'Receive ID type: open_id, user_id, union_id, email, chat_id', 'chat_id')
    .action(async (receiveId: string, opts) => {
      try {
        const svc = await getService()
        const content = JSON.stringify({ file_key: opts.fileKey })
        const result = await svc.callTool('im_v1_message_create', {
          query: { receive_id_type: opts.receiveType },
          body: {
            receive_id: receiveId,
            msg_type: 'file',
            content,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_SEND_FILE_ERROR')
        process.exit(1)
      }
    })

  im
    .command('read-status')
    .description('Get read status of a message')
    .argument('<messageId>', 'Message ID')
    .action(async (messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_read_users', {
          path: { message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_READ_STATUS_ERROR')
        process.exit(1)
      }
    })

  im
    .command('add-reaction')
    .description('Add a reaction to a message')
    .argument('<messageId>', 'Message ID')
    .requiredOption('--emoji <type>', 'Emoji type (e.g. THUMBSUP, SMILE, FISTBUMP)')
    .action(async (messageId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_reaction_create', {
          path: { message_id: messageId },
          body: { reaction_type: { emoji_type: opts.emoji } },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_ADD_REACTION_ERROR')
        process.exit(1)
      }
    })

  im
    .command('remove-reaction')
    .description('Remove a reaction from a message')
    .argument('<messageId>', 'Message ID')
    .argument('<reactionId>', 'Reaction ID to remove')
    .action(async (messageId: string, reactionId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_reaction_delete', {
          path: { message_id: messageId, reaction_id: reactionId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_REMOVE_REACTION_ERROR')
        process.exit(1)
      }
    })

  im
    .command('list-reactions')
    .description('List reactions on a message')
    .argument('<messageId>', 'Message ID')
    .option('--emoji <type>', 'Filter by emoji type')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (messageId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.emoji) query.reaction_type = opts.emoji
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('im_v1_message_reaction_list', {
          path: { message_id: messageId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_LIST_REACTIONS_ERROR')
        process.exit(1)
      }
    })

  im
    .command('pin')
    .description('Pin a message in its chat')
    .argument('<messageId>', 'Message ID to pin')
    .action(async (messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_pin_create', {
          body: { message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_PIN_ERROR')
        process.exit(1)
      }
    })

  im
    .command('unpin')
    .description('Unpin a message')
    .argument('<messageId>', 'Message ID to unpin')
    .action(async (messageId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_pin_delete', {
          path: { message_id: messageId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_UNPIN_ERROR')
        process.exit(1)
      }
    })

  im
    .command('list-pins')
    .description('List pinned messages in a chat')
    .argument('<chatId>', 'Chat ID')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (chatId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { chat_id: chatId, page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('im_v1_pin_list', {
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_LIST_PINS_ERROR')
        process.exit(1)
      }
    })

  im
    .command('merge-forward')
    .description('Merge forward multiple messages to a chat')
    .requiredOption('--message-ids <ids...>', 'Message IDs to forward (space-separated)')
    .requiredOption('--receive-id <id>', 'Target chat ID or user open_id')
    .option('--receive-type <type>', 'Receive ID type: open_id, user_id, union_id, email, chat_id', 'chat_id')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('im_v1_message_merge_forward', {
          query: { receive_id_type: opts.receiveType },
          body: {
            message_id_list: opts.messageIds,
            receive_id: opts.receiveId,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_MERGE_FORWARD_ERROR')
        process.exit(1)
      }
    })

  im
    .command('urgent')
    .description('Send urgent notification for a message')
    .argument('<messageId>', 'Message ID')
    .requiredOption('--type <type>', 'Urgent type: app, sms, or phone')
    .requiredOption('--user-ids <ids...>', 'User IDs to notify (space-separated)')
    .action(async (messageId: string, opts) => {
      try {
        const validTypes = ['app', 'sms', 'phone']
        if (!validTypes.includes(opts.type)) {
          outputError(`Invalid urgent type "${opts.type}". Use: app, sms, or phone`, 'IM_URGENT_INVALID_TYPE')
          process.exit(1)
        }
        const toolName = `im_v1_message_urgent_${opts.type}`
        const svc = await getService()
        const result = await svc.callTool(toolName, {
          path: { message_id: messageId },
          body: { user_id_list: opts.userIds },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'IM_URGENT_ERROR')
        process.exit(1)
      }
    })
}
