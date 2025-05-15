#!/usr/bin/env -S deno run -A

/**
 * @module cli
 * @description Main entry point for the CLI
 */
import CommandRouter from './utils/command-router.ts'
import type { CommandRouteDefinition, CommandRouteOptions } from './utils/command-router.ts'

/**
 * Static mapping of commands
 * We explicitly import all command modules using static imports.
 */
const COMMANDS: Record<string, CommandRouteDefinition> = {
  help: (await import('./commands/help.ts')).default,
  version: (await import('./commands/version.ts')).default,
  // Add more commands if needed, a template for a command is in commands/example.disabled.ts
}

/**
 * Main entry point for the CLI
 */
async function run(): Promise<void> {
  const router : CommandRouter = new CommandRouter(COMMANDS)
  const route : CommandRouteDefinition = router.getRoute(Deno.args)

  try {
    const routeOptions: CommandRouteOptions = router.getOptions(route)
    await route.command(routeOptions)
  } catch (err) {
    throw new Error(`Error executing command: ${err instanceof Error ? err.message : String(err)}`)
  }
}

export default run
