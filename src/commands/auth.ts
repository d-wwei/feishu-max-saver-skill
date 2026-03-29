import http from 'node:http'
import { Command } from 'commander'
import { readConfig, writeConfig } from '../config.js'
import { outputSuccess, outputError } from '../output.js'

const BASE_URL = 'https://open.feishu.cn'
const CALLBACK_PORT = 9876

export function registerAuthCommand(program: Command): void {
  const auth = program.command('auth').description('User authentication (OAuth)')

  auth
    .command('login')
    .description('Login with Feishu OAuth (opens browser)')
    .option('--port <n>', 'Local callback port', String(CALLBACK_PORT))
    .action(async (opts) => {
      try {
        const config = readConfig()
        if (!config || !config.app_id || !config.app_secret) {
          outputError('Configure app credentials first: feishu config set --app-id <id> --app-secret <secret>', 'AUTH_NO_CONFIG')
          process.exit(1)
        }

        const port = parseInt(opts.port)
        const redirectUri = `http://localhost:${port}/callback`

        // Build authorization URL
        const authUrl = `${BASE_URL}/open-apis/authen/v1/authorize?app_id=${config.app_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`

        process.stderr.write(`Opening browser for authorization...\n`)
        process.stderr.write(`If browser doesn't open, visit:\n${authUrl}\n\n`)

        // Open browser
        const { exec } = await import('node:child_process')
        const openCmd = process.platform === 'darwin' ? 'open' :
                        process.platform === 'win32' ? 'start' : 'xdg-open'
        exec(`${openCmd} "${authUrl}"`)

        // Start local server to receive callback
        const code = await waitForCallback(port)

        // Get app_access_token
        const appResp = await fetch(`${BASE_URL}/open-apis/auth/v3/app_access_token/internal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: config.app_id, app_secret: config.app_secret }),
        })
        const appData = await appResp.json() as { code: number; msg: string; app_access_token?: string }
        if (appData.code !== 0 || !appData.app_access_token) {
          throw new Error(`Failed to get app token: ${appData.msg}`)
        }

        // Exchange code for user tokens
        const tokenResp = await fetch(`${BASE_URL}/open-apis/authen/v1/oidc/access_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${appData.app_access_token}`,
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code,
          }),
        })
        const tokenData = await tokenResp.json() as {
          code: number; msg: string
          data?: {
            access_token: string
            refresh_token: string
            expires_in: number
            name?: string
            open_id?: string
          }
        }
        if (tokenData.code !== 0 || !tokenData.data) {
          throw new Error(`Token exchange failed: ${tokenData.msg} (code: ${tokenData.code})`)
        }

        // Save tokens to config
        config.user_access_token = tokenData.data.access_token
        config.user_refresh_token = tokenData.data.refresh_token
        config.user_token_expires_at = Date.now() + (tokenData.data.expires_in - 300) * 1000
        writeConfig(config)

        outputSuccess({
          message: 'Login successful',
          name: tokenData.data.name,
          open_id: tokenData.data.open_id,
          expires_in: tokenData.data.expires_in,
        })
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'AUTH_LOGIN_ERROR')
        process.exit(1)
      }
    })

  auth
    .command('status')
    .description('Show current auth status')
    .action(() => {
      const config = readConfig()
      if (!config) {
        outputError('No configuration found', 'AUTH_NO_CONFIG')
        process.exit(2)
      }

      const hasBot = !!(config.app_id && config.app_secret)
      const hasUser = !!config.user_access_token
      const hasRefresh = !!config.user_refresh_token
      const expired = config.user_token_expires_at ? Date.now() > config.user_token_expires_at : null

      outputSuccess({
        bot_identity: hasBot ? 'configured' : 'not configured',
        user_identity: !hasUser ? 'not configured' :
                       hasRefresh ? (expired ? 'expired (will auto-refresh)' : 'active') :
                       'static token (no auto-refresh)',
        user_token_expires: config.user_token_expires_at
          ? new Date(config.user_token_expires_at).toISOString()
          : null,
        has_refresh_token: hasRefresh,
      })
    })

  auth
    .command('logout')
    .description('Remove user tokens from config')
    .action(() => {
      const config = readConfig()
      if (!config) {
        outputError('No configuration found', 'AUTH_NO_CONFIG')
        process.exit(2)
      }
      delete config.user_access_token
      delete config.user_refresh_token
      delete config.user_token_expires_at
      writeConfig(config)
      outputSuccess({ message: 'User tokens removed' })
    })
}

function waitForCallback(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      server.close()
      reject(new Error('Authorization timed out (120s). Try again.'))
    }, 120_000)

    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${port}`)
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code')
        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end('<h2>Authorization successful</h2><p>You can close this tab and return to the terminal.</p>')
          clearTimeout(timeout)
          server.close()
          resolve(code)
        } else {
          const error = url.searchParams.get('error') || 'no code received'
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(`<h2>Authorization failed</h2><p>${error}</p>`)
          clearTimeout(timeout)
          server.close()
          reject(new Error(`Authorization failed: ${error}`))
        }
      }
    })

    server.listen(port, () => {
      process.stderr.write(`Waiting for authorization on port ${port}...\n`)
    })

    server.on('error', (err) => {
      clearTimeout(timeout)
      reject(new Error(`Failed to start callback server: ${err.message}`))
    })
  })
}
