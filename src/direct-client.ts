import type { FeishuConfig } from './config.js'
import type { FeishuService } from './service.js'

const BASE_URL = 'https://open.feishu.cn'

interface ToolMapping {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
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
}

// Builtin tools that take flat args as body instead of {path, query, body}
const BUILTIN_TOOLS = new Set(['docx_builtin_search', 'docx_builtin_import'])

interface TokenCache {
  token: string
  expiresAt: number
}

export function createDirectService(config: FeishuConfig): FeishuService {
  let tokenCache: TokenCache | null = null

  async function getAccessToken(): Promise<string> {
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
  }
  return descriptions[name] ?? ''
}
