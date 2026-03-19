import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerFolderCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const folder = program.command('folder').description('Folder operations (direct mode)')

  folder
    .command('list')
    .description('List files in a folder')
    .argument('<folderToken>', 'Folder token')
    .action(async (folderToken: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_file_list', {
          query: { folder_token: folderToken },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'FOLDER_LIST_ERROR')
        process.exit(1)
      }
    })

  folder
    .command('create')
    .description('Create a new folder')
    .requiredOption('--parent <token>', 'Parent folder token')
    .requiredOption('--name <name>', 'Folder name')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('drive_v1_file_createFolder', {
          body: {
            folder_token: opts.parent,
            name: opts.name,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'FOLDER_CREATE_ERROR')
        process.exit(1)
      }
    })
}
