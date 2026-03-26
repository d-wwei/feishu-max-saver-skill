import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerCommentCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const comment = program.command('comment').description('Document comment operations')

  comment
    .command('list')
    .description('List comments on a document')
    .argument('<fileToken>', 'File token of the document')
    .option('--file-type <type>', 'File type: doc, docx, sheet', 'docx')
    .option('--page-size <n>', 'Number of comments per page')
    .action(async (fileToken: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { file_type: opts.fileType }
        if (opts.pageSize) query.page_size = opts.pageSize
        const result = await svc.callTool('drive_v1_file_comment_list', {
          path: { file_token: fileToken },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'COMMENT_LIST_ERROR')
        process.exit(1)
      }
    })

  comment
    .command('get')
    .description('Get a specific comment')
    .argument('<fileToken>', 'File token of the document')
    .argument('<commentId>', 'Comment ID')
    .option('--file-type <type>', 'File type: doc, docx, sheet', 'docx')
    .action(async (fileToken: string, commentId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_file_comment_get', {
          path: { file_token: fileToken, comment_id: commentId },
          query: { file_type: opts.fileType },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'COMMENT_GET_ERROR')
        process.exit(1)
      }
    })

  comment
    .command('create')
    .description('Add a comment to a document')
    .argument('<fileToken>', 'File token of the document')
    .requiredOption('--content <text>', 'Comment text content')
    .option('--file-type <type>', 'File type: doc, docx, sheet', 'docx')
    .action(async (fileToken: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_file_comment_create', {
          path: { file_token: fileToken },
          query: { file_type: opts.fileType },
          body: {
            reply_list: {
              replies: [
                {
                  content: {
                    elements: [
                      {
                        type: 'text_run',
                        text_run: { text: opts.content },
                      },
                    ],
                  },
                },
              ],
            },
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'COMMENT_CREATE_ERROR')
        process.exit(1)
      }
    })
}
