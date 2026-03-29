import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { parse, stringify } from 'yaml'

export interface FeishuConfig {
  lark_mcp_url?: string
  app_id?: string
  app_secret?: string
  auth_type?: 'tenant' | 'user'
  user_access_token?: string
  user_refresh_token?: string
  user_token_expires_at?: number
}

export type ConfigMode = 'proxy' | 'direct'

export function getConfigMode(config: FeishuConfig): ConfigMode {
  if (config.app_id && config.app_secret) return 'direct'
  return 'proxy'
}

const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.feishu', 'config.yml')

export function readConfig(configPath = DEFAULT_CONFIG_PATH): FeishuConfig | null {
  if (!fs.existsSync(configPath)) return null
  const raw = fs.readFileSync(configPath, 'utf-8')
  const parsed = parse(raw) as Partial<FeishuConfig>
  if (parsed?.lark_mcp_url) {
    return { lark_mcp_url: parsed.lark_mcp_url }
  }
  if (parsed?.app_id && parsed?.app_secret) {
    const cfg: FeishuConfig = {
      app_id: parsed.app_id,
      app_secret: parsed.app_secret,
      auth_type: parsed.auth_type ?? 'tenant',
    }
    if (parsed.user_access_token) cfg.user_access_token = parsed.user_access_token
    if (parsed.user_refresh_token) cfg.user_refresh_token = parsed.user_refresh_token
    if (parsed.user_token_expires_at) cfg.user_token_expires_at = parsed.user_token_expires_at
    return cfg
  }
  return null
}

export function writeConfig(config: FeishuConfig, configPath = DEFAULT_CONFIG_PATH): void {
  const dir = path.dirname(configPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(configPath, stringify(config), 'utf-8')
}
