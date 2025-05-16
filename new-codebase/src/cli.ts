/**
 * @module cli
 * @description Main entry point for the CLI
 */
import { CommandRouter } from './utils/command-router.ts'
import type { CommandDefinition } from './utils/command-router.ts'
import { getConfig } from './config.ts'
import logger from './utils/logger.ts'
import gracefulShutdown from './utils/graceful-shutdown.ts'

const COMMANDS: Record<string, CommandDefinition> = {
  help: (await import('./commands/help.ts')).default,
  version: (await import('./commands/version.ts')).default,
  // Add more commands if needed, a template for a command is in commands/example.disabled.ts
}

/**
 * Main entry point for the CLI
 */
async function run(): Promise<void> {
  const config = await getConfig()

  const appContext = {}
  const router: CommandRouter = new CommandRouter(COMMANDS)

  await gracefulShutdown.startAndWrap(async () => {
    await router.route(Deno.args, appContext)

    if (config.APP_ENV === 'development') {
      await new Promise(() => {}) // Keep alive indefinitely (or until signal) to help with --watch mode
    }
  }, logger)
}

export default run
