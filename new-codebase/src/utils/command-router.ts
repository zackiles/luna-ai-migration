/**
 * @module command-router
 * @description CLI Command Router for handling command routing and execution.
 * @see {@link https://jsr.io/@std/cli/doc/~/parseArgs}
 * @see {@link https://jsr.io/@std/cli/doc/parse-args/~/Args}
 * @see {@link https://jsr.io/@std/cli/doc/~/ParseOptions}
 */
import { type Args, parseArgs, type ParseOptions } from '@std/cli'

/**
 * Definition of a CLI command route
 */
type CommandDefinition = {
  name: string
  command: (params: CommandContext) => Promise<void> | void
  description: string
  options?: ParseOptions
}

/**
 * Arguments passed to a command's execution function
 */
type CommandContext = {
  /** CLI arguments parsed by std/cli */
  args: Args
  /** Complete list of available command routes */
  routes: CommandDefinition[],
  /** Any additional context the application needs to pass to commands */
  [key: string]: unknown
}

/**
 * Handles CLI command routing and option parsing
 */
class CommandRouter {
  private routes: CommandDefinition[]
  private defaultCommand: string

  /**
   * Creates a new CLI command router instance
   *
   * @param commands Object mapping command names to command definitions
   * @param defaultCommand The default command to use when no command is specified
   */
  constructor(commands: Record<string, CommandDefinition>, defaultCommand = 'help') {
    this.routes = Object.values(commands)
    this.defaultCommand = defaultCommand
  }

  /**
   * Executes a command for the given parsed Deno.args
  */
  async route(args: string[], appContext: Record<string, unknown>): Promise<void> {
    const route : CommandDefinition = this.getRoute(args)
    const routeOptions: CommandContext = this.getOptions(route, appContext)
    return await route.command(routeOptions)
  }

  /**
   * Gets all available command routes
   */
  getRoutes(): CommandDefinition[] {
    return this.routes
  }

  /**
   * Finds the appropriate command based on arguments
   *
   * @param args Command line arguments
   * @returns The matching command definition or the default command
   */
  getRoute(args: string[]): CommandDefinition {
    // The '_' property contains positional arguments (non-flag values) from the command line
    // We pass these to getRoute to find the appropriate command definition
    const _args = parseArgs(args)._

    if (_args.length > 0) {
      const match = this.routes.find((r) => r.name === String(_args[0])) ??
        (_args.length > 1 ? this.routes.find((r) => r.name === String(_args[1])) : undefined)
      if (match) return match
    }
    return this.routes.find((r) => r.name === this.defaultCommand) as CommandDefinition
  }

  /**
   * Parses command options for a given route
   *
   * @param route The command definition
   * @param appContext Any additional context the application needs to pass to commands
   * @returns Command options containing parsed arguments and routes
   */
  getOptions(route: CommandDefinition, appContext: Record<string, unknown>): CommandContext {
    const idx = Deno.args.findIndex((arg) => arg === route.name)
    const args = idx >= 0
      ? parseArgs(Deno.args.slice(idx + 1), route.options)
      : parseArgs([], route.options)

    return {
      args,
      routes: this.routes,
      ...appContext,
    }
  }
}

export { CommandRouter }
export type { CommandDefinition, CommandContext }
