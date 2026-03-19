import { describe, it, expect } from 'vitest'
import { extractWikiToken } from '../src/commands/wiki.js'

describe('extractWikiToken', () => {
  it('extracts token from feishu URL', () => {
    expect(extractWikiToken('https://mycompany.feishu.cn/wiki/abc123')).toBe('abc123')
  })

  it('extracts token from larksuite URL', () => {
    expect(extractWikiToken('https://mycompany.larksuite.com/wiki/def456')).toBe('def456')
  })

  it('extracts token from URL with query params', () => {
    expect(extractWikiToken('https://x.feishu.cn/wiki/tok123?from=search')).toBe('tok123')
  })

  it('extracts token from URL with trailing slash', () => {
    expect(extractWikiToken('https://x.feishu.cn/wiki/tok123/')).toBe('tok123')
  })

  it('returns plain token as-is', () => {
    expect(extractWikiToken('abc123')).toBe('abc123')
  })

  it('handles token with hyphens and underscores', () => {
    expect(extractWikiToken('https://x.feishu.cn/wiki/abc_def-123')).toBe('abc_def-123')
  })
})
