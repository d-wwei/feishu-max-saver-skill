import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerBlockCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const block = program.command('block').description('Document block operations (direct mode)')

  block
    .command('list')
    .description('List all blocks in a document')
    .argument('<docId>', 'Document ID')
    .action(async (docId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('docx_v1_documentBlock_list', {
          path: { document_id: docId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BLOCK_LIST_ERROR')
        process.exit(1)
      }
    })

  block
    .command('update')
    .description('Update a block')
    .argument('<docId>', 'Document ID')
    .argument('<blockId>', 'Block ID')
    .requiredOption('--body <json>', 'Update body as JSON')
    .action(async (docId: string, blockId: string, opts) => {
      try {
        let body: unknown
        try {
          body = JSON.parse(opts.body)
        } catch {
          outputError(`Invalid JSON: ${opts.body}`, 'INVALID_JSON')
          process.exit(1)
        }
        const svc = await getService()
        const result = await svc.callTool('docx_v1_documentBlock_patch', {
          path: { document_id: docId, block_id: blockId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BLOCK_UPDATE_ERROR')
        process.exit(1)
      }
    })

  block
    .command('create')
    .description('Create child blocks under a parent block')
    .argument('<docId>', 'Document ID')
    .argument('<parentBlockId>', 'Parent block ID')
    .requiredOption('--body <json>', 'Children body as JSON')
    .action(async (docId: string, parentBlockId: string, opts) => {
      try {
        let body: unknown
        try {
          body = JSON.parse(opts.body)
        } catch {
          outputError(`Invalid JSON: ${opts.body}`, 'INVALID_JSON')
          process.exit(1)
        }
        const svc = await getService()
        const result = await svc.callTool('docx_v1_documentBlockChildren_create', {
          path: { document_id: docId, block_id: parentBlockId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BLOCK_CREATE_ERROR')
        process.exit(1)
      }
    })

  block
    .command('delete')
    .description('Batch delete child blocks')
    .argument('<docId>', 'Document ID')
    .argument('<parentBlockId>', 'Parent block ID')
    .requiredOption('--start <n>', 'Start index')
    .requiredOption('--end <n>', 'End index')
    .action(async (docId: string, parentBlockId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('docx_v1_documentBlockChildren_batchDelete', {
          path: { document_id: docId, block_id: parentBlockId },
          body: {
            start_index: parseInt(opts.start),
            end_index: parseInt(opts.end),
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BLOCK_DELETE_ERROR')
        process.exit(1)
      }
    })
}
