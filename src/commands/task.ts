import { Command } from 'commander'
import { outputSuccess, outputError } from '../output.js'
import type { FeishuService } from '../service.js'

export function registerTaskCommand(program: Command, getService: () => Promise<FeishuService>): void {
  const task = program.command('task').description('Task operations (Task V2)')

  task
    .command('list')
    .description('List tasks')
    .option('--page-size <n>', 'Page size', '50')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('task_v2_task_list', { query })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_LIST_ERROR')
        process.exit(1)
      }
    })

  task
    .command('get')
    .description('Get task details')
    .argument('<taskId>', 'Task GUID')
    .action(async (taskId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('task_v2_task_get', {
          path: { task_guid: taskId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_GET_ERROR')
        process.exit(1)
      }
    })

  task
    .command('create')
    .description('Create a task')
    .requiredOption('--summary <text>', 'Task summary')
    .option('--due <timestamp>', 'Due time (Unix seconds)')
    .option('--description <text>', 'Task description')
    .option('--reminder <minutes>', 'Remind N minutes before due (requires --due)')
    .action(async (opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = { summary: opts.summary }
        if (opts.due) body.due = { timestamp: opts.due }
        if (opts.description) body.description = opts.description
        if (opts.reminder) {
          body.reminders = [{ relative_fire_minute: parseInt(opts.reminder) }]
        }
        const result = await svc.callTool('task_v2_task_create', { body })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_CREATE_ERROR')
        process.exit(1)
      }
    })

  task
    .command('complete')
    .description('Complete a task')
    .argument('<taskId>', 'Task GUID')
    .action(async (taskId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('task_v2_task_patch', {
          path: { task_guid: taskId },
          body: {
            task: { completed_at: Math.floor(Date.now() / 1000).toString() },
          },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_COMPLETE_ERROR')
        process.exit(1)
      }
    })

  task
    .command('delete')
    .description('Delete a task')
    .argument('<taskId>', 'Task GUID')
    .action(async (taskId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('task_v2_task_delete', {
          path: { task_guid: taskId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_DELETE_ERROR')
        process.exit(1)
      }
    })

  task
    .command('create-subtask')
    .description('Create a subtask under a parent task')
    .argument('<taskId>', 'Parent task GUID')
    .requiredOption('--summary <text>', 'Subtask summary')
    .option('--due <timestamp>', 'Due time (Unix seconds)')
    .option('--description <text>', 'Subtask description')
    .action(async (taskId: string, opts) => {
      try {
        const svc = await getService()
        const body: Record<string, unknown> = { summary: opts.summary }
        if (opts.due) body.due = { timestamp: opts.due }
        if (opts.description) body.description = opts.description
        const result = await svc.callTool('task_v2_task_subtask_create', {
          path: { task_guid: taskId },
          body,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_CREATE_SUBTASK_ERROR')
        process.exit(1)
      }
    })

  task
    .command('list-subtasks')
    .description('List subtasks of a task')
    .argument('<taskId>', 'Parent task GUID')
    .option('--page-size <n>', 'Page size', '50')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (taskId: string, opts) => {
      try {
        const svc = await getService()
        const query: Record<string, string> = { page_size: opts.pageSize }
        if (opts.pageToken) query.page_token = opts.pageToken
        const result = await svc.callTool('task_v2_task_subtask_list', {
          path: { task_guid: taskId },
          query,
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_LIST_SUBTASKS_ERROR')
        process.exit(1)
      }
    })

  task
    .command('add-follower')
    .description('Add a follower to a task')
    .argument('<taskId>', 'Task GUID')
    .requiredOption('--id <userId>', 'User ID to add as follower')
    .option('--id-type <type>', 'ID type: open_id, user_id, union_id', 'open_id')
    .action(async (taskId: string, opts) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('task_v2_task_follower_create', {
          path: { task_guid: taskId },
          body: { id: opts.id, id_type: opts.idType },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_ADD_FOLLOWER_ERROR')
        process.exit(1)
      }
    })

  task
    .command('remove-follower')
    .description('Remove a follower from a task')
    .argument('<taskId>', 'Task GUID')
    .argument('<followerId>', 'Follower ID to remove')
    .action(async (taskId: string, followerId: string) => {
      try {
        const svc = await getService()
        const result = await svc.callTool('task_v2_task_follower_delete', {
          path: { task_guid: taskId, follower_id: followerId },
        })
        outputSuccess(result)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'TASK_REMOVE_FOLLOWER_ERROR')
        process.exit(1)
      }
    })
}
