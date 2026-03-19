import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { readConfig, writeConfig, getConfigMode, type FeishuConfig } from '../src/config.js'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('config', () => {
  let tmpDir: string
  let configPath: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'feishu-cli-test-'))
    configPath = path.join(tmpDir, 'config.yml')
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true })
  })

  it('returns null when config file does not exist', () => {
    const config = readConfig(configPath)
    expect(config).toBeNull()
  })

  it('writes and reads proxy config', () => {
    const config: FeishuConfig = { lark_mcp_url: 'https://example.com/mcp' }
    writeConfig(config, configPath)
    const read = readConfig(configPath)
    expect(read).toEqual(config)
  })

  it('writes and reads direct config', () => {
    const config: FeishuConfig = { app_id: 'cli_abc', app_secret: 'secret123', auth_type: 'tenant' }
    writeConfig(config, configPath)
    const read = readConfig(configPath)
    expect(read).toEqual(config)
  })

  it('defaults auth_type to tenant', () => {
    const config: FeishuConfig = { app_id: 'cli_abc', app_secret: 'secret123' }
    writeConfig(config, configPath)
    const read = readConfig(configPath)
    expect(read?.auth_type).toBe('tenant')
  })

  it('returns null when no valid config fields', () => {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, 'other_key: value\n')
    const config = readConfig(configPath)
    expect(config).toBeNull()
  })

  it('returns null when only app_id without app_secret', () => {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, 'app_id: cli_abc\n')
    const config = readConfig(configPath)
    expect(config).toBeNull()
  })

  describe('getConfigMode', () => {
    it('returns proxy for lark_mcp_url config', () => {
      expect(getConfigMode({ lark_mcp_url: 'https://example.com' })).toBe('proxy')
    })

    it('returns direct for app_id + app_secret config', () => {
      expect(getConfigMode({ app_id: 'id', app_secret: 'secret' })).toBe('direct')
    })

    it('returns proxy when neither is set', () => {
      expect(getConfigMode({})).toBe('proxy')
    })
  })
})
