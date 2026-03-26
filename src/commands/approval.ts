import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerApprovalCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const approval = program.command('approval').description('Approval operations')

  approval
    .command('list')
    .description('List approval instances')
    .argument('<approvalCode>', 'Approval definition code')
    .option('--page-size <n>', 'Page size', '20')
    .action(async (approvalCode: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('approval_v4_instance_list', {
          query: {
            approval_code: approvalCode,
            page_size: opts.pageSize,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'APPROVAL_LIST_ERROR')
        process.exit(1)
      }
    })

  approval
    .command('get')
    .description('Get approval instance details')
    .argument('<instanceId>', 'Approval instance ID')
    .action(async (instanceId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('approval_v4_instance_get', {
          path: { instance_id: instanceId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'APPROVAL_GET_ERROR')
        process.exit(1)
      }
    })

  approval
    .command('create')
    .description('Create an approval instance')
    .argument('<approvalCode>', 'Approval definition code')
    .requiredOption('--form <json>', 'Form data as JSON string')
    .action(async (approvalCode: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('approval_v4_instance_create', {
          body: {
            approval_code: approvalCode,
            form: opts.form,
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'APPROVAL_CREATE_ERROR')
        process.exit(1)
      }
    })
}
