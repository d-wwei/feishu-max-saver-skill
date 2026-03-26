import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerMinutesCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const minutes = program.command('minutes').description('Minutes (妙记) operations')

  minutes
    .command('get')
    .description('Get minute details')
    .argument('<minuteToken>', 'Minute token')
    .action(async (minuteToken: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('minutes_v1_minute_get', {
          path: { minute_token: minuteToken },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MINUTES_GET_ERROR')
        process.exit(1)
      }
    })

  minutes
    .command('statistics')
    .description('Get minute statistics (views, shares)')
    .argument('<minuteToken>', 'Minute token')
    .action(async (minuteToken: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('minutes_v1_minute_statistics', {
          path: { minute_token: minuteToken },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'MINUTES_STATISTICS_ERROR')
        process.exit(1)
      }
    })
}
