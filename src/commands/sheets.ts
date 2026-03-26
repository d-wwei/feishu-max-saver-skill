import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerSheetsCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const sheets = program.command('sheets').description('Spreadsheet (Sheets) operations')

  sheets
    .command('info')
    .description('Get spreadsheet metadata')
    .argument('<spreadsheetToken>', 'Spreadsheet token')
    .action(async (spreadsheetToken: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('sheets_v3_spreadsheet_get', {
          path: { spreadsheet_token: spreadsheetToken },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'SHEETS_INFO_ERROR')
        process.exit(1)
      }
    })

  sheets
    .command('list-sheets')
    .description('List all sheets (tabs) in a spreadsheet')
    .argument('<spreadsheetToken>', 'Spreadsheet token')
    .action(async (spreadsheetToken: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('sheets_v3_spreadsheet_sheet_query', {
          path: { spreadsheet_token: spreadsheetToken },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'SHEETS_LIST_ERROR')
        process.exit(1)
      }
    })

  sheets
    .command('read')
    .description('Read cell values from a range')
    .argument('<spreadsheetToken>', 'Spreadsheet token')
    .argument('<range>', 'Range to read (e.g. Sheet1!A1:C5)')
    .action(async (spreadsheetToken: string, range: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('sheets_v2_spreadsheet_values_get', {
          path: { spreadsheetToken, range },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'SHEETS_READ_ERROR')
        process.exit(1)
      }
    })

  sheets
    .command('write')
    .description('Write cell values to a range')
    .argument('<spreadsheetToken>', 'Spreadsheet token')
    .requiredOption('--range <range>', 'Range to write (e.g. Sheet1!A1:C2)')
    .requiredOption('--values <json>', 'Values as JSON 2D array (e.g. [["a","b"],["c","d"]])')
    .action(async (spreadsheetToken: string, opts) => {
      try {
        const values = JSON.parse(opts.values)
        const svc = await getService()
        const result = await svc.callTool('sheets_v2_spreadsheet_values_update', {
          path: { spreadsheetToken },
          body: {
            valueRange: {
              range: opts.range,
              values,
            },
          },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --values', 'SHEETS_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'SHEETS_WRITE_ERROR')
        }
        process.exit(1)
      }
    })

  sheets
    .command('append')
    .description('Append data to a spreadsheet range')
    .argument('<spreadsheetToken>', 'Spreadsheet token')
    .requiredOption('--range <range>', 'Range to append to (e.g. Sheet1!A1:C1)')
    .requiredOption('--values <json>', 'Values as JSON 2D array (e.g. [["a","b"],["c","d"]])')
    .action(async (spreadsheetToken: string, opts) => {
      try {
        const values = JSON.parse(opts.values)
        const svc = await getService()
        const result = await svc.callTool('sheets_v2_spreadsheet_values_append', {
          path: { spreadsheetToken },
          body: {
            valueRange: {
              range: opts.range,
              values,
            },
          },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --values', 'SHEETS_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'SHEETS_APPEND_ERROR')
        }
        process.exit(1)
      }
    })
}
