import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { FeishuConfig } from './config.js'
import { getConfigMode } from './config.js'
import { createDirectService } from './direct-client.js'

export interface FeishuService {
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>
  listTools(): Promise<Array<{ name: string; description?: string }>>
  close(): Promise<void>
}

export async function initService(config: FeishuConfig): Promise<FeishuService> {
  const mode = getConfigMode(config)

  if (mode === 'direct') {
    return createDirectService(config)
  }

  if (!config.lark_mcp_url) {
    throw new Error('lark_mcp_url is required for proxy mode')
  }

  return createProxyService(config.lark_mcp_url)
}

async function createProxyService(url: string): Promise<FeishuService> {
  const client = new Client({ name: 'feishu-cli', version: '0.1.0' })
  const transport = new StreamableHTTPClientTransport(new URL(url))
  await client.connect(transport)

  return {
    async callTool(name: string, args: Record<string, unknown>) {
      const result = await client.callTool({ name, arguments: args })
      const content = result.content as Array<{ type: string; text?: string }>
      const textParts = content?.filter(c => c.type === 'text' && c.text).map(c => c.text!) ?? []
      const text = textParts.join('\n')
      if (result.isError) {
        throw new Error(text || 'Tool call failed')
      }
      if (!text) return null
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    },

    async listTools() {
      const { tools } = await client.listTools()
      return tools.map(t => ({ name: t.name, description: t.description }))
    },

    async close() {
      await client.close()
    },
  }
}
