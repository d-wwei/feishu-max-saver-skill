import type { FeishuService } from './service.js'
import type { OfficialMcpClient } from './official-mcp-client.js'

// Feishu permission error codes that should trigger MCP fallback
const PERMISSION_ERROR_CODES = new Set([
  99991400, 99991401, 99991403, // General permission errors
  99991663, 99991664,            // Invalid/wrong token type for this API
  99991672,                      // App scope not enabled
  99991679,                      // User scope not authorized
  1770032,                       // Document forbidden
  131006,                        // Wiki permission denied
])

const PERMISSION_ERROR_PATTERNS = [
  'permission denied',
  'forbidden',
  'forBidden',
  'Unauthorized',
  'not permitted',
]

function isPermissionError(error: Error): boolean {
  const msg = error.message
  // Match "API error: ... (code: NNNNN)" format from direct-client.ts
  const codeMatch = msg.match(/\(code:\s*(\d+)\)/)
  if (codeMatch) {
    const code = parseInt(codeMatch[1], 10)
    if (PERMISSION_ERROR_CODES.has(code)) return true
  }
  // Fallback: pattern matching
  const lower = msg.toLowerCase()
  return PERMISSION_ERROR_PATTERNS.some(p => lower.includes(p.toLowerCase()))
}

export type Identity = 'user' | 'bot' | 'auto'

export function createCompositeService(
  directService: FeishuService,
  mcpClient: OfficialMcpClient,
  identity: Identity,
): FeishuService {
  return {
    async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
      // Bot mode: REST only, no MCP fallback
      if (identity === 'bot') {
        return directService.callTool(name, args)
      }

      // User or Auto mode: try REST first, fallback to MCP on permission errors
      try {
        return await directService.callTool(name, args)
      } catch (err) {
        if (!(err instanceof Error) || !isPermissionError(err)) {
          throw err // Not a permission error, don't fallback
        }

        // Check if MCP has this tool before attempting fallback
        // hasTool may return false if MCP hasn't been initialized yet,
        // so we try the call anyway and let MCP throw if tool not found
        try {
          return await mcpClient.callTool(name, args)
        } catch (mcpErr) {
          // If MCP also fails, throw the original REST error (more informative)
          if (mcpErr instanceof Error && mcpErr.message.includes('MCP tool not found')) {
            throw err
          }
          throw mcpErr
        }
      }
    },

    async uploadFile(endpoint: string, fields: Record<string, string>, filePath: string): Promise<unknown> {
      // File upload only supported via REST
      return directService.uploadFile(endpoint, fields, filePath)
    },

    async listTools(): Promise<Array<{ name: string; description?: string }>> {
      const [restTools, mcpTools] = await Promise.all([
        directService.listTools(),
        mcpClient.listTools().catch(() => [] as Array<{ name: string; description?: string }>),
      ])

      // Merge: REST tools first, then MCP-only tools (deduplicated)
      const seen = new Set(restTools.map(t => t.name))
      const merged = [...restTools]
      for (const t of mcpTools) {
        if (!seen.has(t.name)) {
          merged.push(t)
          seen.add(t.name)
        }
      }
      return merged
    },

    async close(): Promise<void> {
      await Promise.all([
        directService.close(),
        mcpClient.close(),
      ])
    },
  }
}
