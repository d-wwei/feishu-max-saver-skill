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

  calendar
    .command('search-events')
    .description('Search events by keyword')
    .argument('<calendarId>', 'Calendar ID')
    .requiredOption('--query <text>', 'Search keyword')
    .option('--start <time>', 'Start time filter (RFC3339)')
    .option('--end <time>', 'End time filter (RFC3339)')
    .option('--page-size <n>', 'Page size', '20')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (calendarId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = { query: opts.query }
        if (opts.start) body.start_time = { timestamp: opts.start }
        if (opts.end) body.end_time = { timestamp: opts.end }
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('calendar_v4_calendar_event_search', {
          path: { calendar_id: calendarId },
          query,
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_SEARCH_EVENTS_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('rsvp')
    .description('RSVP to a calendar event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .requiredOption('--status <status>', 'RSVP status: accept, decline, tentative')
    .action(async (calendarId: string, eventId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('calendar_v4_calendar_event_reply', {
          path: { calendar_id: calendarId, event_id: eventId },
          body: { rsvp_status: opts.status },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_RSVP_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('list-instances')
    .description('List instances of a recurring event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .option('--start <time>', 'Start time (RFC3339)')
    .option('--end <time>', 'End time (RFC3339)')
    .option('--page-size <n>', 'Page size', '50')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (calendarId: string, eventId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.start) query.start_time = opts.start
        if (opts.end) query.end_time = opts.end
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('calendar_v4_calendar_event_instances', {
          path: { calendar_id: calendarId, event_id: eventId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_LIST_INSTANCES_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('list-attendees')
    .description('List attendees of an event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .option('--page-size <n>', 'Page size (max 100)', '50')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (calendarId: string, eventId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('calendar_v4_calendar_event_attendee_list', {
          path: { calendar_id: calendarId, event_id: eventId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_LIST_ATTENDEES_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('add-attendees')
    .description('Add attendees to an event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .requiredOption('--attendees <json>', 'Attendees as JSON array [{type:"user",user_id:"ou_xxx"}]')
    .action(async (calendarId: string, eventId: string, opts) => {
      try {
        const attendees = JSON.parse(opts.attendees)
        const svc = await getService()
        const result = await svc.callTool('calendar_v4_calendar_event_attendee_create', {
          path: { calendar_id: calendarId, event_id: eventId },
          body: { attendees },
        })
        outputSuccess(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          outputError('Invalid JSON in --attendees', 'CALENDAR_JSON_ERROR')
        } else {
          outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_ADD_ATTENDEES_ERROR')
        }
        process.exit(1)
      }
    })

  calendar
    .command('remove-attendees')
    .description('Remove attendees from an event')
    .argument('<calendarId>', 'Calendar ID')
    .argument('<eventId>', 'Event ID')
    .requiredOption('--attendee-ids <ids...>', 'Attendee IDs to remove (space-separated)')
    .action(async (calendarId: string, eventId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('calendar_v4_calendar_event_attendee_batch_delete', {
          path: { calendar_id: calendarId, event_id: eventId },
          body: { attendee_ids: opts.attendeeIds },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_REMOVE_ATTENDEES_ERROR')
        process.exit(1)
      }
    })

  calendar
    .command('freebusy')
    .description('Query free/busy status for a user or room')
    .requiredOption('--start <time>', 'Start time (RFC3339)')
    .requiredOption('--end <time>', 'End time (RFC3339)')
    .option('--user-id <id>', 'User ID to check')
    .option('--room-id <id>', 'Room ID to check')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = {
          time_min: opts.start,
          time_max: opts.end,
        }
        if (opts.userId) body.user_id = opts.userId
        if (opts.roomId) body.room_id = opts.roomId
        const result = await svc.callTool('calendar_v4_freebusy_list', { body })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CALENDAR_FREEBUSY_ERROR')
        process.exit(1)
      }
    })
}
