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

  bitable
    .command('batch-create')
    .description('Batch create records (up to 1000)')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--records <json>', 'Array of record objects, each with a "fields" key')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const records = JSON.parse(opts.records)
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_batch_create', {
          path: { app_token: appToken, table_id: tableId },
          body: { records },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --records', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_BATCH_CREATE_ERROR')
        }
        process.exit(1)
      }
    })

  bitable
    .command('batch-update')
    .description('Batch update records (up to 1000)')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--records <json>', 'Array of {record_id, fields} objects')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const records = JSON.parse(opts.records)
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_batch_update', {
          path: { app_token: appToken, table_id: tableId },
          body: { records },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --records', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_BATCH_UPDATE_ERROR')
        }
        process.exit(1)
      }
    })

  bitable
    .command('batch-delete')
    .description('Batch delete records (up to 500)')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--record-ids <ids...>', 'Record IDs to delete (space-separated)')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_batch_delete', {
          path: { app_token: appToken, table_id: tableId },
          body: { records: opts.recordIds },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_BATCH_DELETE_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('batch-get')
    .description('Batch get records by IDs (up to 100)')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--record-ids <ids...>', 'Record IDs to fetch (space-separated)')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_record_batch_get', {
          path: { app_token: appToken, table_id: tableId },
          body: { record_ids: opts.recordIds },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_BATCH_GET_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('list-fields')
    .description('List fields (columns) in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .option('--view-id <id>', 'Filter by view ID')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.viewId) query.view_id = opts.viewId
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('bitable_v1_app_table_field_list', {
          path: { app_token: appToken, table_id: tableId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_LIST_FIELDS_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('create-field')
    .description('Create a field (column) in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--name <name>', 'Field name')
    .requiredOption('--type <n>', 'Field type number (1=text, 2=number, etc.)')
    .option('--property <json>', 'Field property as JSON')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = {
          field_name: opts.name,
          type: parseInt(opts.type),
        }
        if (opts.property) body.property = JSON.parse(opts.property)
        const result = await svc.callTool('bitable_v1_app_table_field_create', {
          path: { app_token: appToken, table_id: tableId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --property', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_CREATE_FIELD_ERROR')
        }
        process.exit(1)
      }
    })

  bitable
    .command('update-field')
    .description('Update a field (column) in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .argument('<fieldId>', 'Field ID')
    .option('--name <name>', 'New field name')
    .option('--property <json>', 'New field property as JSON')
    .action(async (appToken: string, tableId: string, fieldId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = {}
        if (opts.name) body.field_name = opts.name
        if (opts.property) body.property = JSON.parse(opts.property)
        const result = await svc.callTool('bitable_v1_app_table_field_update', {
          path: { app_token: appToken, table_id: tableId, field_id: fieldId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --property', 'BITABLE_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'BITABLE_UPDATE_FIELD_ERROR')
        }
        process.exit(1)
      }
    })

  bitable
    .command('delete-field')
    .description('Delete a field (column) from a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .argument('<fieldId>', 'Field ID')
    .action(async (appToken: string, tableId: string, fieldId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_field_delete', {
          path: { app_token: appToken, table_id: tableId, field_id: fieldId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_DELETE_FIELD_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('list-views')
    .description('List views in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('bitable_v1_app_table_view_list', {
          path: { app_token: appToken, table_id: tableId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_LIST_VIEWS_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('create-view')
    .description('Create a view in a table')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .requiredOption('--name <name>', 'View name')
    .option('--type <type>', 'View type: grid, kanban, gallery, gantt, form', 'grid')
    .action(async (appToken: string, tableId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_view_create', {
          path: { app_token: appToken, table_id: tableId },
          body: { view_name: opts.name, view_type: opts.type },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_CREATE_VIEW_ERROR')
        process.exit(1)
      }
    })

  bitable
    .command('get-view')
    .description('Get view details')
    .argument('<appToken>', 'Bitable app token')
    .argument('<tableId>', 'Table ID')
    .argument('<viewId>', 'View ID')
    .action(async (appToken: string, tableId: string, viewId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('bitable_v1_app_table_view_get', {
          path: { app_token: appToken, table_id: tableId, view_id: viewId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'BITABLE_GET_VIEW_ERROR')
        process.exit(1)
      }
    })
}
