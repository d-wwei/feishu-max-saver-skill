import { Command } from 'commander'
import { readConfig, writeConfig, getConfigMode } from '../config.js'
import { outputSuccess, outputError } from '../output.js'

export function registerConfigCommand(program: Command): void {
  const config = program.command('config').description('Manage configuration')

  config
    .command('set')
    .description('Set Feishu connection config (proxy or direct mode)')
    .option('--url <url>', 'Lark MCP server URL (proxy mode)')
    .option('--app-id <id>', 'Feishu app ID (direct mode)')
    .option('--app-secret <secret>', 'Feishu app secret (direct mode)')
    .action((opts) => {
      try {
        if (opts.url) {
          writeConfig({ lark_mcp_url: opts.url })
          outputSuccess({ message: 'Configuration saved (proxy mode)', mode: 'proxy' })
        } else if (opts.appId && opts.appSecret) {
          writeConfig({ app_id: opts.appId, app_secret: opts.appSecret, auth_type: 'tenant' })
          outputSuccess({ message: 'Configuration saved (direct mode)', mode: 'direct' })
        } else {
          outputError('Provide either --url (proxy) or --app-id + --app-secret (direct)', 'INVALID_ARGS')
          process.exit(1)
        }
      } catch (err) {
        outputError(err instanceof Error ? err.message : String(err), 'CONFIG_WRITE_ERROR')
        process.exit(1)
      }
    })

  config
    .command('show')
    .description('Show current configuration')
    .action(() => {
      const cfg = readConfig()
      if (!cfg) {
        outputError('No configuration found. Run: feishu config set --help', 'CONFIG_NOT_FOUND')
        process.exit(2)
      }
      const mode = getConfigMode(cfg)
      if (mode === 'proxy') {
        outputSuccess({
          mode: 'proxy',
          lark_mcp_url: cfg.lark_mcp_url!.slice(0, 40) + '...',
        })
      } else {
        outputSuccess({
          mode: 'direct',
          app_id: cfg.app_id,
          app_secret: cfg.app_secret!.slice(0, 4) + '****',
          auth_type: cfg.auth_type,
        })
      }
    })
}
