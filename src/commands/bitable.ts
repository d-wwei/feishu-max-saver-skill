import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerBitableCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const bitable = program.command('bitable').description('Bitable (multi-dimensional table) operations')

  bitable
    .command('list-tables')
    .description('List all tables in a bitable app')
    .argument('<appToken>', 'Bitable app token')
    .action(async (appToken: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_list', {
          path: { app_token: appToken },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_LIST_TABLES_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('list-records')
    .description('List records in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .option('--page-size <n>', 'Page size (max 500)', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .option('--view-id <id>', 'View ID to filter by')
    .option('--filter <expression>', 'Filter expression')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        if (opts.viewId) query.view_id = opts.viewId
        if (opts.filter) query.filter = opts.filter
        const result = await svc.callTool('bitable_v1_app_table_record_list', {
          path: { app_token: appToken, table_id: tableId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_LIST_RECORDS_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('get-record')
    .description('Get a specific record')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .argument('<recordId>', 'Record ID')
    .action(async (appToken: string, tableId: string, recordId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_get', {
          path: { app_token: appToken, table_id: tableId, record_id: recordId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_GET_RECORD_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('create-record')
    .description('Create a record in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--fields <json>', 'Record fields as JSON object')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const fields = JSON.parse(opts.fields)
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_create', {
          path: { app_token: appToken, table_id: tableId },
          body: { fields },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --fields', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_CREATE_RECORD_ERROR')
        }
        process.exit(1)
      }
    })

  bitable
    .command('update-record')
    .description('Update a record in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .argument('<recordId>', 'Record ID')
    .requiredOption('--fields <json>', 'Fields to update as JSON object')
    .action(async (appToken: string, tableId: string, recordId: string, opts) => {
      try {
        const fields = JSON.parse(opts.fields)
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_update', {
          path: { app_token: appToken, table_id: tableId, record_id: recordId },
          body: { fields },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --fields', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_UPDATE_RECORD_ERROR')
        }
        process.exit(1)
      }
    })

  bitable
    .command('delete-record')
    .description('Delete a record from a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .argument('<recordId>', 'Record ID')
    .action(async (appToken: string, tableId: string, recordId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_delete', {
          path: { app_token: appToken, table_id: tableId, record_id: recordId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_DELETE_RECORD_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('search-records')
    .description('Search records in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .option('--filter <json>', 'Filter conditions as JSON')
    .option('--sort <json>', 'Sort conditions as JSON array')
    .option('--page-size <n>', 'Page size (max 500)', '20')
    .option('--fields <names...>', 'Field names to return')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = { page_size: parseInt(opts.pageSize) }
        if (opts.filter) body.filter = JSON.parse(opts.filter)
        if (opts.sort) body.sort = JSON.parse(opts.sort)
        if (opts.fields) body.field_names = opts.fields
        const result = await svc.callTool('bitable_v1_app_table_record_search', {
          path: { app_token: appToken, table_id: tableId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in filter or sort', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_SEARCH_ERROR')
        }
        process.exit(1)
      }
    })
}
