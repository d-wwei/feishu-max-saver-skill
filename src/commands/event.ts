import WebSocket from 'ws'
import { Command } from 'commander'
import { readConfig } from '../config.js'
import { outputError } from '../output.js'

const BASE_URL = 'https://open.feishu.cn'

export function registerEventCommand(program: Command): void {
  const event = program.command('event').description('Real-time event subscription (WebSocket)')

  event
    .command('subscribe')
    .description('Subscribe to Feishu events via WebSocket (long-running, outputs NDJSON)')
    .option('--reconnect', 'Auto-reconnect on disconnect', true)
    .option('--no-reconnect', 'Disable auto-reconnect')
    .action(async (opts) => {
      try {
        const config = readConfig()
        if (!config || !config.app_id || !config.app_secret) {
          outputError('Configure app credentials first: feishu config set --app-id <id> --app-secret <secret>', 'EVENT_NO_CONFIG')
          process.exit(1)
        }

        process.stderr.write('Connecting to Feishu event stream...\n')

        await connectAndListen(config.app_id, config.app_secret, opts.reconnect)
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'EVENT_SUBSCRIBE_ERROR')
        process.exit(1)
      }
    })
}

async function getAppAccessToken(appId: string, appSecret: string): Promise<string> {
  const resp = await fetch(`${BASE_URL}/open-apis/auth/v3/app_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  })
  const data = await resp.json() as { code: number; msg: string; app_access_token?: string }
  if (data.code !== 0 || !data.app_access_token) {
    throw new Error(`Failed to get app token: ${data.msg} (code: ${data.code})`)
  }
  return data.app_access_token
}

async function getWsEndpoint(appAccessToken: string): Promise<{ url: string; pingInterval?: number }> {
  const resp = await fetch(`${BASE_URL}/callback/ws/endpoint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${appAccessToken}`,
    },
    body: JSON.stringify({}),
  })
  const data = await resp.json() as {
    code: number; msg: string
    data?: { url: string; client_config?: { ping_interval?: number } }
  }
  if (data.code !== 0 || !data.data?.url) {
    throw new Error(`Failed to get WebSocket endpoint: ${data.msg} (code: ${data.code})`)
  }
  return {
    url: data.data.url,
    pingInterval: data.data.client_config?.ping_interval,
  }
}

async function connectAndListen(appId: string, appSecret: string, autoReconnect: boolean): Promise<void> {
  const appToken = await getAppAccessToken(appId, appSecret)
  const endpoint = await getWsEndpoint(appToken)

  process.stderr.write(`Connected. Listening for events...\n`)
  process.stderr.write(`(Press Ctrl+C to stop)\n`)

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(endpoint.url)
    let pingTimer: ReturnType<typeof setInterval> | null = null

    ws.on('open', () => {
      // Start ping keepalive
      const interval = (endpoint.pingInterval || 120) * 1000
      pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping()
        }
      }, interval)
    })

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())

        // Handle Feishu protocol messages
        if (msg.type === 'pong' || msg.header?.event_type === 'ping') {
          return // skip protocol messages
        }

        // Output event as NDJSON line to stdout
        process.stdout.write(JSON.stringify(msg) + '\n')
      } catch {
        // Non-JSON message, output as-is
        process.stdout.write(JSON.stringify({ raw: raw.toString() }) + '\n')
      }
    })

    ws.on('close', (code, reason) => {
      if (pingTimer) clearInterval(pingTimer)
      process.stderr.write(`WebSocket closed (code: ${code}, reason: ${reason.toString()})\n`)

      if (autoReconnect && code !== 1000) {
        process.stderr.write('Reconnecting in 5 seconds...\n')
        setTimeout(() => {
          connectAndListen(appId, appSecret, autoReconnect).then(resolve, reject)
        }, 5000)
      } else {
        resolve()
      }
    })

    ws.on('error', (err) => {
      if (pingTimer) clearInterval(pingTimer)
      process.stderr.write(`WebSocket error: ${err.message}\n`)

      if (autoReconnect) {
        process.stderr.write('Reconnecting in 5 seconds...\n')
        setTimeout(() => {
          connectAndListen(appId, appSecret, autoReconnect).then(resolve, reject)
        }, 5000)
      } else {
        reject(err)
      }
    })

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      process.stderr.write('\nShutting down event subscription...\n')
      if (pingTimer) clearInterval(pingTimer)
      ws.close(1000)
      process.exit(0)
    })
  })
}
