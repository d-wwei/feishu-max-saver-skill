import fs from 'node:fs'
import path from 'node:path'
import type { FeishuConfig } from './config.js'
import { writeConfig } from './config.js'
import type { FeishuService } from './service.js'

const BASE_URL = 'https://open.feishu.cn'

interface ToolMapping {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
}

const TOOL_MAP: Record<string, ToolMapping> = {
  docx_v1_document_create: { method: 'POST', path: '/open-apis/docx/v1/documents' },
  docx_v1_document_get: { method: 'GET', path: '/open-apis/docx/v1/documents/{document_id}' },
  docx_v1_document_rawContent: { method: 'GET', path: '/open-apis/docx/v1/documents/{document_id}/raw_content' },
  docx_v1_documentBlock_list: { method: 'GET', path: '/open-apis/docx/v1/documents/{document_id}/blocks' },
  docx_v1_documentBlock_patch: { method: 'PATCH', path: '/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}' },
  docx_v1_documentBlockChildren_create: { method: 'POST', path: '/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/children' },
  docx_v1_documentBlockChildren_batchDelete: { method: 'DELETE', path: '/open-apis/docx/v1/documents/{document_id}/blocks/{block_id}/children/batch_delete' },
  docx_builtin_search: { method: 'POST', path: '/open-apis/suite/docs-api/search/object' },
  wiki_v2_space_getNode: { method: 'GET', path: '/open-apis/wiki/v2/spaces/get_node' },
  drive_v1_file_list: { method: 'GET', path: '/open-apis/drive/v1/files' },
  drive_v1_file_createFolder: { method: 'POST', path: '/open-apis/drive/v1/files/create_folder' },
  drive_v1_file_delete: { method: 'DELETE', path: '/open-apis/drive/v1/files/{file_token}' },

  // IM
  im_v1_message_create: { method: 'POST', path: '/open-apis/im/v1/messages' },
  im_v1_message_reply: { method: 'POST', path: '/open-apis/im/v1/messages/{message_id}/reply' },
  im_v1_message_list: { method: 'GET', path: '/open-apis/im/v1/messages' },
  im_v1_message_get: { method: 'GET', path: '/open-apis/im/v1/messages/{message_id}' },
  im_v1_message_forward: { method: 'POST', path: '/open-apis/im/v1/messages/{message_id}/forward' },
  im_v1_message_delete: { method: 'DELETE', path: '/open-apis/im/v1/messages/{message_id}' },
  im_v1_message_read_users: { method: 'GET', path: '/open-apis/im/v1/messages/{message_id}/read_users' },
  im_v1_message_merge_forward: { method: 'POST', path: '/open-apis/im/v1/messages/merge_forward' },
  im_v1_message_urgent_app: { method: 'PATCH', path: '/open-apis/im/v1/messages/{message_id}/urgent_app' },
  im_v1_message_urgent_sms: { method: 'PATCH', path: '/open-apis/im/v1/messages/{message_id}/urgent_sms' },
  im_v1_message_urgent_phone: { method: 'PATCH', path: '/open-apis/im/v1/messages/{message_id}/urgent_phone' },

  // Reactions
  im_v1_message_reaction_create: { method: 'POST', path: '/open-apis/im/v1/messages/{message_id}/reactions' },
  im_v1_message_reaction_delete: { method: 'DELETE', path: '/open-apis/im/v1/messages/{message_id}/reactions/{reaction_id}' },
  im_v1_message_reaction_list: { method: 'GET', path: '/open-apis/im/v1/messages/{message_id}/reactions' },

  // Pins
  im_v1_pin_create: { method: 'POST', path: '/open-apis/im/v1/pins' },
  im_v1_pin_delete: { method: 'DELETE', path: '/open-apis/im/v1/pins/{message_id}' },
  im_v1_pin_list: { method: 'GET', path: '/open-apis/im/v1/pins' },

  // Bitable
  bitable_v1_app_table_list: { method: 'GET', path: '/open-apis/bitable/v1/apps/{app_token}/tables' },
  bitable_v1_app_table_record_list: { method: 'GET', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records' },
  bitable_v1_app_table_record_get: { method: 'GET', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}' },
  bitable_v1_app_table_record_create: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records' },
  bitable_v1_app_table_record_update: { method: 'PATCH', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}' },
  bitable_v1_app_table_record_delete: { method: 'DELETE', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/{record_id}' },
  bitable_v1_app_table_record_search: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/search' },
  bitable_v1_app_table_record_batch_create: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_create' },
  bitable_v1_app_table_record_batch_update: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_update' },
  bitable_v1_app_table_record_batch_delete: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_delete' },
  bitable_v1_app_table_record_batch_get: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records/batch_get' },
  bitable_v1_app_table_field_list: { method: 'GET', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields' },
  bitable_v1_app_table_field_create: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields' },
  bitable_v1_app_table_field_update: { method: 'PUT', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields/{field_id}' },
  bitable_v1_app_table_field_delete: { method: 'DELETE', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/fields/{field_id}' },
  bitable_v1_app_table_view_list: { method: 'GET', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/views' },
  bitable_v1_app_table_view_create: { method: 'POST', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/views' },
  bitable_v1_app_table_view_get: { method: 'GET', path: '/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/views/{view_id}' },

  // Chat
  im_v1_chat_list: { method: 'GET', path: '/open-apis/im/v1/chats' },
  im_v1_chat_get: { method: 'GET', path: '/open-apis/im/v1/chats/{chat_id}' },
  im_v1_chat_create: { method: 'POST', path: '/open-apis/im/v1/chats' },
  im_v1_chat_update: { method: 'PUT', path: '/open-apis/im/v1/chats/{chat_id}' },
  im_v1_chat_members: { method: 'GET', path: '/open-apis/im/v1/chats/{chat_id}/members' },
  im_v1_chat_members_create: { method: 'POST', path: '/open-apis/im/v1/chats/{chat_id}/members' },
  im_v1_chat_members_delete: { method: 'DELETE', path: '/open-apis/im/v1/chats/{chat_id}/members' },
  im_v1_chat_link: { method: 'POST', path: '/open-apis/im/v1/chats/{chat_id}/link' },
  im_v1_chat_search: { method: 'GET', path: '/open-apis/im/v1/chats/search' },
  im_v1_chat_announcement_get: { method: 'GET', path: '/open-apis/im/v1/chats/{chat_id}/announcement' },
  im_v1_chat_announcement_patch: { method: 'PATCH', path: '/open-apis/im/v1/chats/{chat_id}/announcement' },

  // Contact
  contact_v3_user_get: { method: 'GET', path: '/open-apis/contact/v3/users/{user_id}' },
  contact_v3_user_search: { method: 'POST', path: '/open-apis/contact/v3/users/search' },
  contact_v3_department_get: { method: 'GET', path: '/open-apis/contact/v3/departments/{department_id}' },
  contact_v3_department_list: { method: 'GET', path: '/open-apis/contact/v3/departments' },

  // Task
  task_v2_task_list: { method: 'GET', path: '/open-apis/task/v2/tasks' },
  task_v2_task_get: { method: 'GET', path: '/open-apis/task/v2/tasks/{task_guid}' },
  task_v2_task_create: { method: 'POST', path: '/open-apis/task/v2/tasks' },
  task_v2_task_patch: { method: 'PATCH', path: '/open-apis/task/v2/tasks/{task_guid}' },
  task_v2_task_delete: { method: 'DELETE', path: '/open-apis/task/v2/tasks/{task_guid}' },
  task_v2_task_subtask_create: { method: 'POST', path: '/open-apis/task/v2/tasks/{task_guid}/subtasks' },
  task_v2_task_subtask_list: { method: 'GET', path: '/open-apis/task/v2/tasks/{task_guid}/subtasks' },
  task_v2_task_follower_create: { method: 'POST', path: '/open-apis/task/v2/tasks/{task_guid}/followers' },
  task_v2_task_follower_delete: { method: 'DELETE', path: '/open-apis/task/v2/tasks/{task_guid}/followers/{follower_id}' },

  // Approval
  approval_v4_instance_list: { method: 'GET', path: '/open-apis/approval/v4/instances' },
  approval_v4_instance_get: { method: 'GET', path: '/open-apis/approval/v4/instances/{instance_id}' },
  approval_v4_instance_create: { method: 'POST', path: '/open-apis/approval/v4/instances' },

  // Sheets
  sheets_v3_spreadsheet_get: { method: 'GET', path: '/open-apis/sheets/v3/spreadsheets/{spreadsheet_token}' },
  sheets_v3_spreadsheet_sheet_query: { method: 'GET', path: '/open-apis/sheets/v3/spreadsheets/{spreadsheet_token}/sheets/query' },
  sheets_v2_spreadsheet_values_get: { method: 'GET', path: '/open-apis/sheets/v2/spreadsheets/{spreadsheetToken}/values/{range}' },
  sheets_v2_spreadsheet_values_update: { method: 'PUT', path: '/open-apis/sheets/v2/spreadsheets/{spreadsheetToken}/values' },
  sheets_v2_spreadsheet_values_append: { method: 'POST', path: '/open-apis/sheets/v2/spreadsheets/{spreadsheetToken}/values_append' },

  // Comment
  drive_v1_file_comment_list: { method: 'GET', path: '/open-apis/drive/v1/files/{file_token}/comments' },
  drive_v1_file_comment_get: { method: 'GET', path: '/open-apis/drive/v1/files/{file_token}/comments/{comment_id}' },
  drive_v1_file_comment_create: { method: 'POST', path: '/open-apis/drive/v1/files/{file_token}/comments' },

  // Search
  search_v2_message: { method: 'POST', path: '/open-apis/search/v2/message' },
  search_v2_app: { method: 'POST', path: '/open-apis/search/v2/app' },

  // Calendar
  calendar_v4_calendar_list: { method: 'GET', path: '/open-apis/calendar/v4/calendars' },
  calendar_v4_calendar_event_list: { method: 'GET', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events' },
  calendar_v4_calendar_event_get: { method: 'GET', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}' },
  calendar_v4_calendar_event_create: { method: 'POST', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events' },
  calendar_v4_calendar_event_delete: { method: 'DELETE', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}' },
  calendar_v4_calendar_event_search: { method: 'POST', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/search' },
  calendar_v4_calendar_event_reply: { method: 'POST', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}/reply' },
  calendar_v4_calendar_event_instances: { method: 'GET', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}/instances' },
  calendar_v4_calendar_event_attendee_list: { method: 'GET', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}/attendees' },
  calendar_v4_calendar_event_attendee_create: { method: 'POST', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}/attendees' },
  calendar_v4_calendar_event_attendee_batch_delete: { method: 'POST', path: '/open-apis/calendar/v4/calendars/{calendar_id}/events/{event_id}/attendees/batch_delete' },
  calendar_v4_freebusy_list: { method: 'POST', path: '/open-apis/calendar/v4/freebusy/list' },

  // Minutes
  minutes_v1_minute_get: { method: 'GET', path: '/open-apis/minutes/v1/minutes/{minute_token}' },
  minutes_v1_minute_statistics: { method: 'GET', path: '/open-apis/minutes/v1/minutes/{minute_token}/statistics' },

  // VC
  vc_v1_reserve_create: { method: 'POST', path: '/open-apis/vc/v1/reserves' },
  vc_v1_reserve_get: { method: 'GET', path: '/open-apis/vc/v1/reserves/{reserve_id}' },
  vc_v1_reserve_delete: { method: 'DELETE', path: '/open-apis/vc/v1/reserves/{reserve_id}' },
  vc_v1_meeting_get: { method: 'GET', path: '/open-apis/vc/v1/meetings/{meeting_id}' },
  vc_v1_meeting_listByNo: { method: 'GET', path: '/open-apis/vc/v1/meetings/list_by_no' },

  // Drive Permission
  drive_v1_permission_member_list: { method: 'GET', path: '/open-apis/drive/v1/permissions/{token}/members' },
  drive_v1_permission_member_create: { method: 'POST', path: '/open-apis/drive/v1/permissions/{token}/members' },
  drive_v1_permission_member_update: { method: 'PATCH', path: '/open-apis/drive/v1/permissions/{token}/members/{member_id}' },
  drive_v1_permission_member_delete: { method: 'DELETE', path: '/open-apis/drive/v1/permissions/{token}/members/{member_id}' },

  // Mail
  mail_v1_mailgroup_list: { method: 'GET', path: '/open-apis/mail/v1/mailgroups' },
  mail_v1_mailgroup_get: { method: 'GET', path: '/open-apis/mail/v1/mailgroups/{mailgroup_id}' },
  mail_v1_mailgroup_member_list: { method: 'GET', path: '/open-apis/mail/v1/mailgroups/{mailgroup_id}/members' },
  mail_v1_public_mailbox_list: { method: 'GET', path: '/open-apis/mail/v1/public_mailboxes' },

  // User Mailbox
  mail_v1_user_mailbox_message_list: { method: 'GET', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/messages' },
  mail_v1_user_mailbox_message_get: { method: 'GET', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/messages/{message_id}' },
  mail_v1_user_mailbox_message_send: { method: 'POST', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/messages' },
  mail_v1_user_mailbox_message_delete: { method: 'DELETE', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/messages/{message_id}' },
  mail_v1_user_mailbox_draft_list: { method: 'GET', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/messages' },
  mail_v1_user_mailbox_draft_create: { method: 'POST', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/drafts' },
  mail_v1_user_mailbox_draft_get: { method: 'GET', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/drafts/{draft_id}' },
  mail_v1_user_mailbox_draft_send: { method: 'POST', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/drafts/{draft_id}/send' },
  mail_v1_user_mailbox_draft_delete: { method: 'DELETE', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/drafts/{draft_id}' },
  mail_v1_user_mailbox_folder_list: { method: 'GET', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/folders' },
  mail_v1_user_mailbox_folder_create: { method: 'POST', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/folders' },
  mail_v1_user_mailbox_folder_delete: { method: 'DELETE', path: '/open-apis/mail/v1/user_mailboxes/{user_mailbox_id}/folders/{folder_id}' },

  // Lingo (enterprise glossary)
  lingo_v1_entity_search: { method: 'POST', path: '/open-apis/lingo/v1/entities/search' },
  lingo_v1_entity_get: { method: 'GET', path: '/open-apis/lingo/v1/entities/{entity_id}' },
  lingo_v1_entity_list: { method: 'GET', path: '/open-apis/lingo/v1/entities' },
  lingo_v1_entity_create: { method: 'POST', path: '/open-apis/lingo/v1/entities' },

  // OKR
  okr_v1_user_okr_list: { method: 'GET', path: '/open-apis/okr/v1/users/{user_id}/okrs' },
  okr_v1_okr_get: { method: 'GET', path: '/open-apis/okr/v1/okrs/{okr_id}' },
  okr_v1_period_list: { method: 'GET', path: '/open-apis/okr/v1/periods' },

  // Report
  report_v1_rule_query: { method: 'POST', path: '/open-apis/report/v1/rules/query' },
  report_v1_task_query: { method: 'POST', path: '/open-apis/report/v1/tasks/query' },

  // Tenant
  tenant_v2_tenant_get: { method: 'GET', path: '/open-apis/tenant/v2/tenant' },

  // Attendance
  attendance_v1_user_task_query: { method: 'POST', path: '/open-apis/attendance/v1/user_tasks/query' },
  attendance_v1_user_stats_data_query: { method: 'POST', path: '/open-apis/attendance/v1/user_stats_datas/query' },
  attendance_v1_shift_list: { method: 'GET', path: '/open-apis/attendance/v1/shifts' },
  attendance_v1_shift_get: { method: 'GET', path: '/open-apis/attendance/v1/shifts/{shift_id}' },

  // Admin
  admin_v1_audit_info_list: { method: 'GET', path: '/open-apis/admin/v1/audit_infos' },
  admin_v1_admin_dept_stat_list: { method: 'GET', path: '/open-apis/admin/v1/admin_dept_stats' },
  admin_v1_admin_user_stat_list: { method: 'GET', path: '/open-apis/admin/v1/admin_user_stats' },
}

// Builtin tools that take flat args as body instead of {path, query, body}
const BUILTIN_TOOLS = new Set(['docx_builtin_search', 'docx_builtin_import'])

interface TokenCache {
  token: string
  expiresAt: number
}

export function createDirectService(config: FeishuConfig, identity: 'user' | 'bot' = 'bot'): FeishuService {
  let tokenCache: TokenCache | null = null

  async function refreshUserToken(): Promise<string> {
    if (!config.user_refresh_token) {
      throw new Error('No refresh token. Run: feishu auth login')
    }
    // Need app access token to refresh user token
    const appResp = await fetch(`${BASE_URL}/open-apis/auth/v3/app_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: config.app_id, app_secret: config.app_secret }),
    })
    const appData = await appResp.json() as { code: number; msg: string; app_access_token?: string }
    if (appData.code !== 0 || !appData.app_access_token) {
      throw new Error(`Failed to get app token for refresh: ${appData.msg}`)
    }

    const resp = await fetch(`${BASE_URL}/open-apis/authen/v1/oidc/refresh_access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appData.app_access_token}`,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: config.user_refresh_token,
      }),
    })
    const data = await resp.json() as {
      code: number; msg: string
      data?: { access_token: string; refresh_token: string; expires_in: number }
    }
    if (data.code !== 0 || !data.data) {
      throw new Error(`Token refresh failed: ${data.msg} (code: ${data.code}). Run: feishu auth login`)
    }

    // Update config with new tokens
    config.user_access_token = data.data.access_token
    config.user_refresh_token = data.data.refresh_token
    config.user_token_expires_at = Date.now() + (data.data.expires_in - 300) * 1000
    writeConfig(config)

    return data.data.access_token
  }

  async function getAccessToken(): Promise<string> {
    if (identity === 'user') {
      // Check if we have a valid token
      if (config.user_access_token && config.user_token_expires_at && Date.now() < config.user_token_expires_at) {
        return config.user_access_token
      }
      // Try refresh
      if (config.user_refresh_token) {
        return refreshUserToken()
      }
      // Fallback: static token (legacy manual paste)
      if (config.user_access_token) {
        return config.user_access_token
      }
      throw new Error('No user token configured. Run: feishu auth login')
    }

    if (tokenCache && Date.now() < tokenCache.expiresAt) {
      return tokenCache.token
    }

    const resp = await fetch(`${BASE_URL}/open-apis/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: config.app_id,
        app_secret: config.app_secret,
      }),
    })

    const data = await resp.json() as { code: number; msg: string; tenant_access_token?: string; expire?: number }
    if (data.code !== 0 || !data.tenant_access_token) {
      throw new Error(`Failed to get access token: ${data.msg} (code: ${data.code})`)
    }

    tokenCache = {
      token: data.tenant_access_token,
      // Expire 5 minutes early to be safe
      expiresAt: Date.now() + (data.expire! - 300) * 1000,
    }
    return tokenCache.token
  }

  function buildUrl(template: string, pathParams: Record<string, string>, queryParams?: Record<string, string>): string {
    let url = BASE_URL + template.replace(/\{(\w+)\}/g, (_, key) => {
      const val = pathParams[key]
      if (val === undefined) throw new Error(`Missing path parameter: ${key}`)
      return encodeURIComponent(val)
    })

    if (queryParams && Object.keys(queryParams).length > 0) {
      const qs = new URLSearchParams(queryParams).toString()
      url += '?' + qs
    }
    return url
  }

  async function callApi(method: string, url: string, body?: unknown): Promise<unknown> {
    const token = await getAccessToken()
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    const resp = await fetch(url, {
      method,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })

    const text = await resp.text()
    let data: { code?: number; msg?: string; data?: unknown }
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`API returned non-JSON (HTTP ${resp.status}): ${text.slice(0, 200)}`)
    }
    if (data.code && data.code !== 0) {
      throw new Error(`API error: ${data.msg} (code: ${data.code})`)
    }
    return data.data ?? data
  }

  return {
    async callTool(name: string, args: Record<string, unknown>) {
      const mapping = TOOL_MAP[name]
      if (!mapping) {
        throw new Error(`Unknown tool: ${name}. Use "tool list" to see available tools.`)
      }

      let pathParams: Record<string, string> = {}
      let queryParams: Record<string, string> | undefined
      let body: unknown

      if (BUILTIN_TOOLS.has(name)) {
        // Builtin tools: flat args go directly to body
        body = args
      } else {
        // Standard tools: structured {path, query, body}
        const p = (args.path ?? {}) as Record<string, string>
        const q = (args.query ?? {}) as Record<string, string>
        const b = args.body as unknown
        pathParams = p
        if (Object.keys(q).length > 0) queryParams = q
        if (b !== undefined) body = b
      }

      const url = buildUrl(mapping.path, pathParams, queryParams)
      return callApi(mapping.method, url, body)
    },

    async uploadFile(endpoint: string, fields: Record<string, string>, filePath: string) {
      const token = await getAccessToken()
      const fileBuffer = fs.readFileSync(filePath)
      const fileName = fields.file_name || path.basename(filePath)

      const formData = new FormData()
      for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value)
      }
      formData.append('file', new Blob([fileBuffer]), fileName)

      const url = BASE_URL + endpoint
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })

      const text = await resp.text()
      let data: { code?: number; msg?: string; data?: unknown }
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(`Upload API returned non-JSON (HTTP ${resp.status}): ${text.slice(0, 200)}`)
      }
      if (data.code && data.code !== 0) {
        throw new Error(`Upload error: ${data.msg} (code: ${data.code})`)
      }
      return data.data ?? data
    },

    async listTools() {
      return Object.entries(TOOL_MAP).map(([name]) => ({
        name,
        description: getToolDescription(name),
      }))
    },

    async close() {
      // No persistent connection to close
    },
  }
}

function getToolDescription(name: string): string {
  const descriptions: Record<string, string> = {
    docx_v1_document_create: 'Create a new document',
    docx_v1_document_get: 'Get document metadata',
    docx_v1_document_rawContent: 'Get document plain text content',
    docx_v1_documentBlock_list: 'List document blocks',
    docx_v1_documentBlock_patch: 'Update a document block',
    docx_v1_documentBlockChildren_create: 'Create child blocks',
    docx_v1_documentBlockChildren_batchDelete: 'Batch delete child blocks',
    docx_builtin_search: 'Search documents',
    wiki_v2_space_getNode: 'Get wiki node info',
    drive_v1_file_list: 'List files in a folder',
    drive_v1_file_createFolder: 'Create a folder',
    drive_v1_file_delete: 'Delete a file or document',
    im_v1_message_create: 'Send a message to a chat',
    im_v1_message_reply: 'Reply to a message',
    im_v1_message_list: 'List messages in a chat',
    im_v1_message_get: 'Get a specific message',
    im_v1_message_forward: 'Forward a message',
    im_v1_message_delete: 'Recall (delete) a message',
    im_v1_message_read_users: 'Get message read status',
    im_v1_message_merge_forward: 'Merge forward multiple messages',
    im_v1_message_urgent_app: 'Send urgent notification via app',
    im_v1_message_urgent_sms: 'Send urgent notification via SMS',
    im_v1_message_urgent_phone: 'Send urgent notification via phone call',
    im_v1_message_reaction_create: 'Add a reaction to a message',
    im_v1_message_reaction_delete: 'Remove a reaction from a message',
    im_v1_message_reaction_list: 'List reactions on a message',
    im_v1_pin_create: 'Pin a message',
    im_v1_pin_delete: 'Unpin a message',
    im_v1_pin_list: 'List pinned messages in a chat',
    bitable_v1_app_table_list: 'List tables in a bitable app',
    bitable_v1_app_table_record_list: 'List records in a table',
    bitable_v1_app_table_record_get: 'Get a specific record',
    bitable_v1_app_table_record_create: 'Create a record in a table',
    bitable_v1_app_table_record_update: 'Update a record in a table',
    bitable_v1_app_table_record_delete: 'Delete a record from a table',
    bitable_v1_app_table_record_search: 'Search records in a table',
    bitable_v1_app_table_record_batch_create: 'Batch create records (up to 1000)',
    bitable_v1_app_table_record_batch_update: 'Batch update records (up to 1000)',
    bitable_v1_app_table_record_batch_delete: 'Batch delete records (up to 500)',
    bitable_v1_app_table_record_batch_get: 'Batch get records by IDs (up to 100)',
    bitable_v1_app_table_field_list: 'List fields in a table',
    bitable_v1_app_table_field_create: 'Create a field in a table',
    bitable_v1_app_table_field_update: 'Update a field in a table',
    bitable_v1_app_table_field_delete: 'Delete a field from a table',
    bitable_v1_app_table_view_list: 'List views in a table',
    bitable_v1_app_table_view_create: 'Create a view in a table',
    bitable_v1_app_table_view_get: 'Get view details',
    drive_v1_file_comment_list: 'List comments on a document',
    drive_v1_file_comment_get: 'Get a specific comment',
    drive_v1_file_comment_create: 'Add a comment to a document',
    search_v2_message: 'Search messages',
    search_v2_app: 'Search applications',
    calendar_v4_calendar_list: 'List calendars',
    calendar_v4_calendar_event_list: 'List events in a calendar',
    calendar_v4_calendar_event_get: 'Get a specific event',
    calendar_v4_calendar_event_create: 'Create a calendar event',
    calendar_v4_calendar_event_delete: 'Delete a calendar event',
    calendar_v4_calendar_event_search: 'Search events by keyword',
    calendar_v4_calendar_event_reply: 'RSVP to an event (accept/decline/tentative)',
    calendar_v4_calendar_event_instances: 'List instances of a recurring event',
    calendar_v4_calendar_event_attendee_list: 'List attendees of an event',
    calendar_v4_calendar_event_attendee_create: 'Add attendees to an event',
    calendar_v4_calendar_event_attendee_batch_delete: 'Remove attendees from an event',
    calendar_v4_freebusy_list: 'Query free/busy status for users or rooms',
    im_v1_chat_list: 'List chats the bot is in',
    im_v1_chat_get: 'Get chat (group) info',
    im_v1_chat_create: 'Create a new chat (group)',
    im_v1_chat_update: 'Update chat properties',
    im_v1_chat_members: 'List members of a chat',
    im_v1_chat_members_create: 'Add members to a chat',
    im_v1_chat_members_delete: 'Remove members from a chat',
    im_v1_chat_link: 'Get chat share link',
    im_v1_chat_search: 'Search chats by keyword',
    im_v1_chat_announcement_get: 'Get chat announcement',
    im_v1_chat_announcement_patch: 'Update chat announcement',
    contact_v3_user_get: 'Get user info',
    contact_v3_user_search: 'Search users by keyword',
    contact_v3_department_get: 'Get department info',
    contact_v3_department_list: 'List sub-departments',
    task_v2_task_list: 'List tasks',
    task_v2_task_get: 'Get task details',
    task_v2_task_create: 'Create a task',
    task_v2_task_patch: 'Update a task',
    task_v2_task_delete: 'Delete a task',
    task_v2_task_subtask_create: 'Create a subtask',
    task_v2_task_subtask_list: 'List subtasks of a task',
    task_v2_task_follower_create: 'Add a follower to a task',
    task_v2_task_follower_delete: 'Remove a follower from a task',
    approval_v4_instance_list: 'List approval instances',
    approval_v4_instance_get: 'Get approval instance details',
    approval_v4_instance_create: 'Create an approval instance',
    sheets_v3_spreadsheet_get: 'Get spreadsheet metadata',
    sheets_v3_spreadsheet_sheet_query: 'List sheets in a spreadsheet',
    sheets_v2_spreadsheet_values_get: 'Read cell values from a range',
    sheets_v2_spreadsheet_values_update: 'Write cell values to a range',
    sheets_v2_spreadsheet_values_append: 'Append data to a spreadsheet',
    minutes_v1_minute_get: 'Get minute details',
    minutes_v1_minute_statistics: 'Get minute statistics',
    vc_v1_reserve_create: 'Reserve (schedule) a meeting',
    vc_v1_reserve_get: 'Get reserve details',
    vc_v1_reserve_delete: 'Cancel a reservation',
    vc_v1_meeting_get: 'Get meeting details',
    vc_v1_meeting_listByNo: 'List meetings by meeting number',
    drive_v1_permission_member_list: 'List document collaborators',
    drive_v1_permission_member_create: 'Add a document collaborator',
    drive_v1_permission_member_update: 'Update collaborator permission',
    drive_v1_permission_member_delete: 'Remove a document collaborator',
    mail_v1_mailgroup_list: 'List mail groups',
    mail_v1_mailgroup_get: 'Get mail group details',
    mail_v1_mailgroup_member_list: 'List mail group members',
    mail_v1_public_mailbox_list: 'List public mailboxes',
    mail_v1_user_mailbox_message_list: 'List emails in a mailbox',
    mail_v1_user_mailbox_message_get: 'Get email details',
    mail_v1_user_mailbox_message_send: 'Send an email',
    mail_v1_user_mailbox_message_delete: 'Delete an email',
    mail_v1_user_mailbox_draft_list: 'List drafts',
    mail_v1_user_mailbox_draft_create: 'Create a draft',
    mail_v1_user_mailbox_draft_get: 'Get draft details',
    mail_v1_user_mailbox_draft_send: 'Send a draft',
    mail_v1_user_mailbox_draft_delete: 'Delete a draft',
    mail_v1_user_mailbox_folder_list: 'List mailbox folders',
    mail_v1_user_mailbox_folder_create: 'Create a mailbox folder',
    mail_v1_user_mailbox_folder_delete: 'Delete a mailbox folder',
    lingo_v1_entity_search: 'Search glossary entities',
    lingo_v1_entity_get: 'Get glossary entity details',
    lingo_v1_entity_list: 'List all glossary entities',
    lingo_v1_entity_create: 'Create a glossary entity',
    okr_v1_user_okr_list: "List user's OKRs",
    okr_v1_okr_get: 'Get OKR details',
    okr_v1_period_list: 'List OKR periods',
    report_v1_rule_query: 'List report rules',
    report_v1_task_query: 'List report tasks',
    tenant_v2_tenant_get: 'Get tenant info',
    attendance_v1_user_task_query: 'Query user attendance records',
    attendance_v1_user_stats_data_query: 'Query attendance statistics data',
    attendance_v1_shift_list: 'List available shifts',
    attendance_v1_shift_get: 'Get shift details',
    admin_v1_audit_info_list: 'Get audit logs',
    admin_v1_admin_dept_stat_list: 'Get department statistics',
    admin_v1_admin_user_stat_list: 'Get user activity statistics',
  }
  return descriptions[name] ?? ''
}
