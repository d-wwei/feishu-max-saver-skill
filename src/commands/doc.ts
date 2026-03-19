import { createInterface } from 'node:readline'
import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'
import { markdownToBlocks } from '../markdown-to-blocks.js'

function confirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stderr })
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close()
      resolve(answer.trim().toLowerCase() === 'y')
    })
  })
}

export function registerDocCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const doc = program.command('doc').description('Document operations')

  doc
    .command('info')
    .description('Get document metadata')
    .argument('<documentId>', 'Document ID')
    .action(async (documentId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('docx_v1_document_get', {
          path: { document_id: documentId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'DOC_INFO_ERROR')
        process.exit(1)
      }
    })

  doc
    .command('create')
    .description('Create a new document')
    .option('--title <title>', 'Document title')
    .option('--folder <token>', 'Folder token to create in')
    .option('--content <markdown>', 'Markdown content (proxy mode: import via MCP)')
    .option('--name <name>', 'File name (proxy mode)')
    .action(async (opts) => {
      try {
        const svc = await getService()
        if (opts.content) {
          // Proxy mode: import from markdown
          const result = await svc.callTool('docx_builtin_import', {
            markdown: opts.content,
            ...(opts.name && { file_name: opts.name }),
          })
          outputSuccess(result)
        } else {
          // Direct mode: create empty doc with title
          const body: Record<string, unknown> = {}
          if (opts.title) body.title = opts.title
          if (opts.folder) body.folder_token = opts.folder
          const result = await svc.callTool('docx_v1_document_create', { body })
          outputSuccess(result)
        }
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'DOC_CREATE_ERROR')
        process.exit(1)
      }
    })

  doc
    .command('delete')
    .description('Delete a document')
    .argument('<documentId>', 'Document ID')
    .option('--type <type>', 'File type: docx,doc,sheet,bitable,mindnote,file,slides', 'docx')
    .option('-y, --yes', 'Skip confirmation')
    .action(async (documentId: string, opts) => {
      try {
        if (!opts.yes) {
          const ok = await confirm(`确认删除文档 ${documentId}？此操作不可恢复 (y/N) `)
          if (!ok) {
            outputError('Cancelled', 'CANCELLED')
            process.exit(0)
          }
        }
        const svc = await getService()
        const result = await svc.callTool('drive_v1_file_delete', {
          path: { file_token: documentId },
          query: { type: opts.type },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'DOC_DELETE_ERROR')
        process.exit(1)
      }
    })

  doc
    .command('read')
    .description('Get document plain text content')
    .argument('<documentId>', 'Document ID')
    .action(async (documentId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('docx_v1_document_rawContent', {
          path: { document_id: documentId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'DOC_READ_ERROR')
        process.exit(1)
      }
    })

  doc
    .command('search')
    .description('Search documents')
    .argument('<keyword>', 'Search keyword')
    .option('--count <n>', 'Number of results (max 50)', '10')
    .option('--type <types...>', 'Doc types: doc,sheet,slides,bitable,mindnote,file')
    .action(async (keyword: string, opts) => {
      try {
        const svc = await getService()
        const args: Record<string, unknown> = {
          search_key: keyword,
          count: parseInt(opts.count),
        }
        if (opts.type) args.docs_types = opts.type
        const result = await svc.callTool('docx_builtin_search', args)
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'DOC_SEARCH_ERROR')
        process.exit(1)
      }
    })

  doc
    .command('write')
    .description('Write markdown/HTML content into an existing document')
    .argument('<documentId>', 'Document ID')
    .requiredOption('--content <text>', 'Content to write (markdown or HTML)')
    .option('--format <fmt>', 'Content format: markdown or html', 'markdown')
    .option('--index <n>', 'Insert position (-1 = append)', '-1')
    .action(async (documentId: string, opts) => {
      try {
        const svc = await getService()
        const blocks = markdownToBlocks(opts.content)
        if (blocks.length === 0) {
          outputError('No content blocks generated from input', 'DOC_WRITE_ERROR')
          process.exit(1)
        }

        // Get the page block ID (root block)
        const blockList = await svc.callTool('docx_v1_documentBlock_list', {
          path: { document_id: documentId },
        }) as { items?: Array<{ block_id: string; block_type: number }> }
        const pageBlock = blockList?.items?.find(b => b.block_type === 1)
        if (!pageBlock) {
          outputError('Could not find page block in document', 'DOC_WRITE_ERROR')
          process.exit(1)
        }

        // Create children blocks under the page block
        const body: Record<string, unknown> = { children: blocks }
        const index = parseInt(opts.index)
        if (index >= 0) body.index = index

        const result = await svc.callTool('docx_v1_documentBlockChildren_create', {
          path: { document_id: documentId, block_id: pageBlock.block_id },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'DOC_WRITE_ERROR')
        process.exit(1)
      }
    })
}
