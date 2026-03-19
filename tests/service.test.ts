import { describe, it, expect, vi } from 'vitest'
import { initService } from '../src/service.js'

// Mock MCP SDK
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    callTool: vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: '{"data":"ok"}' }],
    }),
    listTools: vi.fn().mockResolvedValue({ tools: [{ name: 'test_tool' }] }),
    close: vi.fn(),
  })),
}))

vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: vi.fn(),
}))

// Mock direct client
vi.mock('../src/direct-client.js', () => ({
  createDirectService: vi.fn().mockReturnValue({
    callTool: vi.fn().mockResolvedValue({ data: 'direct-ok' }),
    listTools: vi.fn().mockResolvedValue([{ name: 'docx_v1_document_get' }]),
    close: vi.fn(),
  }),
}))

describe('initService', () => {
  describe('proxy mode', () => {
    it('creates a service with callTool', async () => {
      const svc = await initService({ lark_mcp_url: 'https://example.com/mcp' })
      expect(svc.callTool).toBeDefined()
      expect(svc.listTools).toBeDefined()
      expect(svc.close).toBeDefined()
    })

    it('callTool parses JSON response', async () => {
      const svc = await initService({ lark_mcp_url: 'https://example.com/mcp' })
      const result = await svc.callTool('test', {})
      expect(result).toEqual({ data: 'ok' })
    })

    it('listTools returns tool names', async () => {
      const svc = await initService({ lark_mcp_url: 'https://example.com/mcp' })
      const tools = await svc.listTools()
      expect(tools).toEqual([{ name: 'test_tool' }])
    })

    it('throws when lark_mcp_url is empty in proxy mode', async () => {
      await expect(initService({})).rejects.toThrow('lark_mcp_url is required')
    })
  })

  describe('direct mode', () => {
    it('routes to direct service when app_id and app_secret are set', async () => {
      const svc = await initService({ app_id: 'test_id', app_secret: 'test_secret' })
      expect(svc.callTool).toBeDefined()
      const result = await svc.callTool('docx_v1_document_get', {})
      expect(result).toEqual({ data: 'direct-ok' })
    })

    it('listTools returns direct tools', async () => {
      const svc = await initService({ app_id: 'test_id', app_secret: 'test_secret' })
      const tools = await svc.listTools()
      expect(tools).toEqual([{ name: 'docx_v1_document_get' }])
    })
  })
})
