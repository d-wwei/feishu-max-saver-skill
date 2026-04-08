import type { McpEndpoint } from './config.js'

const PROTOCOL_VERSION = '2024-11-05'
const CLIENT_INFO = { name: 'feishu-cli', version: '1.0.0' }
const REQUEST_TIMEOUT = 30_000

interface EndpointState {
  url: string
  name: string
  initialized: boolean
  jsonRpcId: number
  tools: Map<string, string> // mcpToolName → description
}

interface JsonRpcResponse {
  jsonrpc: string
  id: number
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

// --- SSE / Response parsing ---

function parseSseResponse(text: string): unknown {
  const lines = text.split('\n')
  let lastData: string | null = null
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('data:')) {
      lastData = trimmed.slice(5).trim()
    }
  }
  if (!lastData) throw new Error('No data received in SSE response')
  const parsed = JSON.parse(lastData) as JsonRpcResponse
  if (parsed.error) {
    throw new Error(`MCP error: ${parsed.error.message || JSON.stringify(parsed.error)}`)
  }
  return parsed.result
}

function normalizeToolPayload(result: unknown): unknown {
  if (!result || typeof result !== 'object') return result
  const r = result as Record<string, unknown>

  // Unwrap MCP content[].text wrapper
  if (Array.isArray(r.content)) {
    for (const item of r.content as Array<{ type?: string; text?: string }>) {
      if (item?.text && typeof item.text === 'string') {
        try {
          const t = item.text.trim()
          if (t.startsWith('{') || t.startsWith('[')) return JSON.parse(t)
        } catch { /* not JSON, continue */ }
      }
    }
  }
  if (typeof r.text === 'string') {
    try {
      const t = r.text.trim()
      if (t.startsWith('{') || t.startsWith('[')) return JSON.parse(t)
    } catch { /* not JSON */ }
  }
  return result
}

// --- JSON-RPC transport ---

async function sendJsonRpc(endpoint: EndpointState, method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: ++endpoint.jsonRpcId,
    method,
    params,
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const resp = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      },
      body,
      signal: controller.signal,
    })

    if (!resp.ok) {
      throw new Error(`MCP HTTP error: ${resp.status} ${resp.statusText}`)
    }

    const text = await resp.text()
    const ct = resp.headers.get('content-type') ?? ''

    if (ct.includes('text/event-stream')) {
      return parseSseResponse(text)
    }

    const parsed = JSON.parse(text) as JsonRpcResponse
    if (parsed.error) {
      throw new Error(`MCP error: ${parsed.error.message || JSON.stringify(parsed.error)}`)
    }
    return parsed.result
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error(`MCP request timeout (${REQUEST_TIMEOUT / 1000}s)`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// --- Endpoint lifecycle ---

async function initializeEndpoint(ep: EndpointState): Promise<void> {
  if (ep.initialized) return

  await sendJsonRpc(ep, 'initialize', {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: CLIENT_INFO,
  })

  // Discover available tools
  const result = await sendJsonRpc(ep, 'tools/list', {}) as {
    tools?: Array<{ name: string; description?: string }>
  }
  if (result?.tools) {
    for (const t of result.tools) {
      ep.tools.set(t.name, t.description ?? '')
    }
  }

  ep.initialized = true
}

// --- Tool name matching ---

function normalizeToolName(name: string): string {
  // Normalize for fuzzy matching: lowercase, remove underscores
  // e.g. 'bitable_v1_app_table_record_search' and 'bitable_v1_appTableRecord_search'
  // both become 'bitablev1apptablerecordsearch'
  return name.toLowerCase().replace(/_/g, '')
}

// --- Public interface ---

export interface OfficialMcpClient {
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>
  listTools(): Promise<Array<{ name: string; description?: string }>>
  hasTool(name: string): boolean
  close(): Promise<void>
}

export function createOfficialMcpClient(endpoints: McpEndpoint[]): OfficialMcpClient {
  const states: EndpointState[] = endpoints.map(ep => ({
    url: ep.url,
    name: ep.name,
    initialized: false,
    jsonRpcId: 0,
    tools: new Map(),
  }))

  // Lazily built: normalizedRestName → { endpoint, mcpToolName }
  let toolIndex: Map<string, { endpoint: EndpointState; mcpToolName: string }> | null = null
  let allInitialized = false

  async function ensureAllInitialized(): Promise<void> {
    if (allInitialized) return
    await Promise.all(states.map(ep => initializeEndpoint(ep)))
    allInitialized = true

    // Build tool index
    toolIndex = new Map()
    for (const ep of states) {
      for (const [mcpName] of ep.tools) {
        // Exact match key
        toolIndex.set(mcpName, { endpoint: ep, mcpToolName: mcpName })
        // Normalized key for fuzzy matching
        const norm = normalizeToolName(mcpName)
        if (!toolIndex.has(norm)) {
          toolIndex.set(norm, { endpoint: ep, mcpToolName: mcpName })
        }
      }
    }
  }

  function findTool(name: string): { endpoint: EndpointState; mcpToolName: string } | null {
    if (!toolIndex) return null
    // Exact match
    const exact = toolIndex.get(name)
    if (exact) return exact
    // Fuzzy match
    const norm = normalizeToolName(name)
    return toolIndex.get(norm) ?? null
  }

  return {
    async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
      await ensureAllInitialized()

      const match = findTool(name)
      if (!match) {
        throw new Error(`MCP tool not found: ${name}`)
      }

      const result = await sendJsonRpc(match.endpoint, 'tools/call', {
        name: match.mcpToolName,
        arguments: args,
      })

      return normalizeToolPayload(result)
    },

    async listTools(): Promise<Array<{ name: string; description?: string }>> {
      await ensureAllInitialized()

      const tools: Array<{ name: string; description?: string }> = []
      for (const ep of states) {
        for (const [name, desc] of ep.tools) {
          tools.push({ name, description: desc || undefined })
        }
      }
      return tools
    },

    hasTool(name: string): boolean {
      if (!toolIndex) return false
      return findTool(name) !== null
    },

    async close(): Promise<void> {
      // Stateless HTTP - nothing to close
    },
  }
}
