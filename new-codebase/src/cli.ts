#!/usr/bin/env -S deno run -A

/**
 * @module cli
 * @description Main entry point for the CLI
 */
import { CommandRouter, } from './utils/command-router.ts'
import type { CommandDefinition } from './utils/command-router.ts'

/**
 * Static mapping of commands
 * We explicitly import all command modules using static imports.
 */
const COMMANDS: Record<string, CommandDefinition> = {
  help: (await import('./commands/help.ts')).default,
  version: (await import('./commands/version.ts')).default,
  // Add more commands if needed, a template for a command is in commands/example.disabled.ts
}

/**
 * Main entry point for the CLI
 */
async function run(): Promise<void> {
  // TODO: Set any global state here to pass to commands.
  const appContext = {}
  const router : CommandRouter = new CommandRouter(COMMANDS)
  await router.route(Deno.args, appContext)
}

export default run
