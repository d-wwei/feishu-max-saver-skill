import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerCalendarCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const calendar = program.command('calendar').description('Calendar operations')

  calendar
    .command('list')
    .description('List calendars')
    .action(async () => {
      try {
        const svc = await getService()
        const result = await svc.callTool('calendar_v4_calendar_list', {})
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_LIST_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('list-events')
    .description('List events in a calendar')
    .argument('<calendarId>', 'Calendar ID')
    .option('--start <timestamp>', 'Start time (Unix seconds or RFC3339)')
    .option('--end <timestamp>', 'End time (Unix seconds or RFC3339)')
    .option('--page-size <n>', 'Page size (max 500)', '50')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (calendarId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.start) query.start_time = opts.start
        if (opts.end) query.end_time = opts.end
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('calendar_v4_calendar_event_list', {
          path: { calendar_id: calendarId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_LIST_EVENTS_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('get-event')
    .description('Get a specific calendar event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .action(async (calendarId: string, eventId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('calendar_v4_calendar_event_get', {
          path: { calendar_id: calendarId, event_id: eventId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_GET_EVENT_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('create-event')
    .description('Create a calendar event')
    .argument('<calendarId>', 'Calendar ID')
    .requiredOption('--summary <title>', 'Event title')
    .requiredOption('--start <time>', 'Start time (RFC3339, e.g. 2026-03-27T09:00:00+08:00)')
    .requiredOption('--end <time>', 'End time (RFC3339, e.g. 2026-03-27T10:00:00+08:00)')
    .option('--description <text>', 'Event description')
    .option('--location <place>', 'Event location')
    .action(async (calendarId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = {
          summary: opts.summary,
          start_time: { timestamp: opts.start },
          end_time: { timestamp: opts.end },
        }
        if (opts.description) body.description = opts.description
        if (opts.location) body.location = { name: opts.location }
        const result = await svc.callTool('calendar_v4_calendar_event_create', {
          path: { calendar_id: calendarId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_CREATE_EVENT_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('delete-event')
    .description('Delete a calendar event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .action(async (calendarId: string, eventId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('calendar_v4_calendar_event_delete', {
          path: { calendar_id: calendarId, event_id: eventId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_DELETE_EVENT_ERROR')
        process.exit(1)
      }
    })
}
