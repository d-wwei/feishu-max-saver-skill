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
}
