import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerVcCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const vc = program.command('vc').description('Video conferencing operations')

  vc
    .command('reserve')
    .description('Reserve (schedule) a meeting')
    .requiredOption('--topic <title>', 'Meeting topic')
    .option('--start <timestamp>', 'Start time (Unix seconds)')
    .option('--end <timestamp>', 'End time (Unix seconds)')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const meetingSettings: Record<string, unknown> = { topic: opts.topic }
        if (opts.start) meetingSettings.start_time = opts.start
        if (opts.end) meetingSettings.end_time = opts.end
        const result = await svc.callTool('vc_v1_reserve_create', {
          body: { meeting_settings: meetingSettings },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'VC_RESERVE_ERROR')
        process.exit(1)
      }
    })

  vc
    .command('get-reserve')
    .description('Get reserve details')
    .argument('<reserveId>', 'Reserve ID')
    .action(async (reserveId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('vc_v1_reserve_get', {
          path: { reserve_id: reserveId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'VC_GET_RESERVE_ERROR')
        process.exit(1)
      }
    })

  vc
    .command('cancel-reserve')
    .description('Cancel a reservation')
    .argument('<reserveId>', 'Reserve ID')
    .action(async (reserveId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('vc_v1_reserve_delete', {
          path: { reserve_id: reserveId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'VC_CANCEL_RESERVE_ERROR')
        process.exit(1)
      }
    })

  vc
    .command('get-meeting')
    .description('Get meeting details')
    .argument('<meetingId>', 'Meeting ID')
    .action(async (meetingId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('vc_v1_meeting_get', {
          path: { meeting_id: meetingId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'VC_GET_MEETING_ERROR')
        process.exit(1)
      }
    })

  vc
    .command('list-by-no')
    .description('List meetings by meeting number')
    .argument('<meetingNo>', 'Meeting number')
    .action(async (meetingNo: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('vc_v1_meeting_listByNo', {
          query: { meeting_no: meetingNo },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'VC_LIST_BY_NO_ERROR')
        process.exit(1)
      }
    })
}
