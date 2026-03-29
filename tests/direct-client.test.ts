import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createDirectService } from '../src/direct-client.js'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockTokenResponse() {
  mockFetch.mockResolvedValueOnce({
    json: () => Promise.resolve({
      code: 0,
      tenant_access_token: 'test-token-123',
      expire: 7200,
    }),
  })
}

function mockApiResponse(data: unknown) {
  const body = JSON.stringify({ code: 0, data })
  mockFetch.mockResolvedValueOnce({
    status: 200,
    text: () => Promise.resolve(body),
    json: () => Promise.resolve(JSON.parse(body)),
  })
}

describe('createDirectService', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  const config = { app_id: 'test_app', app_secret: 'test_secret' }

  describe('getAccessToken', () => {
    it('fetches and caches token', async () => {
      mockTokenResponse()
      mockApiResponse({ document: { title: 'Test' } })

      const svc = createDirectService(config)
      await svc.callTool('docx_v1_document_get', { path: { document_id: 'doc123' } })

      // First call should request token
      expect(mockFetch).toHaveBeenCalledTimes(2)
      const tokenCall = mockFetch.mock.calls[0]
      expect(tokenCall[0]).toContain('tenant_access_token/internal')
      expect(JSON.parse(tokenCall[1].body)).toEqual({ app_id: 'test_app', app_secret: 'test_secret' })
    })

    it('reuses cached token on second call', async () => {
      mockTokenResponse()
      mockApiResponse({ doc1: true })
      mockApiResponse({ doc2: true })

      const svc = createDirectService(config)
      await svc.callTool('docx_v1_document_get', { path: { document_id: 'doc1' } })
      await svc.callTool('docx_v1_document_get', { path: { document_id: 'doc2' } })

      // Only 1 token request + 2 API calls = 3 total
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('throws on token error', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ code: 10003, msg: 'invalid app_id' }),
      })

      const svc = createDirectService(config)
      await expect(svc.callTool('docx_v1_document_get', { path: { document_id: 'x' } }))
        .rejects.toThrow('Failed to get access token')
    })
  })

  describe('callTool', () => {
    it('calls GET with path params', async () => {
      mockTokenResponse()
      mockApiResponse({ document: { title: 'Hello' } })

      const svc = createDirectService(config)
      const result = await svc.callTool('docx_v1_document_get', {
        path: { document_id: 'docABC' },
      })

      expect(result).toEqual({ document: { title: 'Hello' } })
      const apiCall = mockFetch.mock.calls[1]
      expect(apiCall[0]).toContain('/open-apis/docx/v1/documents/docABC')
      expect(apiCall[1].method).toBe('GET')
    })

    it('calls GET with query params', async () => {
      mockTokenResponse()
      mockApiResponse({ files: [] })

      const svc = createDirectService(config)
      await svc.callTool('drive_v1_file_list', {
        query: { folder_token: 'fld_abc' },
      })

      const apiCall = mockFetch.mock.calls[1]
      expect(apiCall[0]).toContain('folder_token=fld_abc')
    })

    it('calls POST with body for builtin tools', async () => {
      mockTokenResponse()
      mockApiResponse({ docs: [{ title: 'Found' }] })

      const svc = createDirectService(config)
      await svc.callTool('docx_builtin_search', {
        search_key: 'test',
        count: 10,
      })

      const apiCall = mockFetch.mock.calls[1]
      expect(apiCall[1].method).toBe('POST')
      expect(JSON.parse(apiCall[1].body)).toEqual({ search_key: 'test', count: 10 })
    })

    it('calls POST with structured body', async () => {
      mockTokenResponse()
      mockApiResponse({ document: { document_id: 'new123' } })

      const svc = createDirectService(config)
      await svc.callTool('docx_v1_document_create', {
        body: { title: 'New Doc' },
      })

      const apiCall = mockFetch.mock.calls[1]
      expect(apiCall[1].method).toBe('POST')
      expect(JSON.parse(apiCall[1].body)).toEqual({ title: 'New Doc' })
    })

    it('calls PATCH with path params and body', async () => {
      mockTokenResponse()
      mockApiResponse({ block: { block_id: 'blk1' } })

      const svc = createDirectService(config)
      await svc.callTool('docx_v1_documentBlock_patch', {
        path: { document_id: 'doc1', block_id: 'blk1' },
        body: { update_text_elements: {} },
      })

      const apiCall = mockFetch.mock.calls[1]
      expect(apiCall[0]).toContain('/documents/doc1/blocks/blk1')
      expect(apiCall[1].method).toBe('PATCH')
    })

    it('throws on unknown tool', async () => {
      const svc = createDirectService(config)
      await expect(svc.callTool('nonexistent_tool', {})).rejects.toThrow('Unknown tool: nonexistent_tool')
    })

    it('throws on API error response', async () => {
      mockTokenResponse()
      const errBody = JSON.stringify({ code: 99999, msg: 'permission denied' })
      mockFetch.mockResolvedValueOnce({
        status: 400,
        text: () => Promise.resolve(errBody),
        json: () => Promise.resolve(JSON.parse(errBody)),
      })

      const svc = createDirectService(config)
      await expect(svc.callTool('docx_v1_document_get', { path: { document_id: 'x' } }))
        .rejects.toThrow('API error: permission denied')
    })
  })

  describe('listTools', () => {
    it('returns all mapped tools', async () => {
      const svc = createDirectService(config)
      const tools = await svc.listTools()
      expect(tools.length).toBeGreaterThan(100)
      expect(tools.find(t => t.name === 'docx_v1_document_create')).toBeDefined()
      expect(tools.find(t => t.name === 'drive_v1_file_list')).toBeDefined()
      expect(tools.find(t => t.name === 'im_v1_message_reaction_create')).toBeDefined()
      expect(tools.find(t => t.name === 'im_v1_pin_create')).toBeDefined()
      expect(tools.find(t => t.name === 'im_v1_chat_search')).toBeDefined()
    })
  })

  describe('user identity mode', () => {
    it('uses user_access_token when identity is user', async () => {
      const userConfig = { app_id: 'test_app', app_secret: 'test_secret', user_access_token: 'u-tok-123' }
      mockApiResponse({ items: [] })

      const svc = createDirectService(userConfig, 'user')
      await svc.callTool('im_v1_chat_list', { query: {} })

      // Should NOT fetch tenant token; should use user token directly
      expect(mockFetch).toHaveBeenCalledTimes(1) // only API call, no token call
      const apiCall = mockFetch.mock.calls[0]
      expect(apiCall[1].headers['Authorization']).toBe('Bearer u-tok-123')
    })

    it('throws when user identity but no user_access_token', async () => {
      const svc = createDirectService({ app_id: 'test_app', app_secret: 'test_secret' }, 'user')
      await expect(svc.callTool('im_v1_chat_list', { query: {} }))
        .rejects.toThrow('User access token not configured')
    })
  })

  describe('close', () => {
    it('resolves without error', async () => {
      const svc = createDirectService(config)
      await expect(svc.close()).resolves.toBeUndefined()
    })
  })
})
