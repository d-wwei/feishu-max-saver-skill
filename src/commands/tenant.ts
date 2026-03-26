import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerTenantCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const tenant = program.command('tenant').description('Tenant (租户) operations')

  tenant
    .command('info')
    .description('Get current tenant info')
    .action(async () => {
      try {
        const svc = await getService()
        const result = await svc.callTool('tenant_v2_tenant_get', {})
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TENANT_INFO_ERROR')
        process.exit(1)
      }
    })
}
