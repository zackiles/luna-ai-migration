import type { CommandContext, CommandDefinition } from '../utils/command-router.ts'
import logger from '../utils/logger.ts'
import { getConfig } from '../config.ts'

const config = await getConfig()

const commandRouteDefinition: CommandDefinition = {
  name: 'example',
  command: command,
  description: 'An example command template',
  options: {
    boolean: ['flag'],
    alias: { f: 'flag' },
  },
}

function command({ args, routes, context }: CommandContext): void {
  logger.print(`Command ${commandRouteDefinition.name} executed`, {
    args,
    config,
    routes,
    context,
  })
}

export { command, commandRouteDefinition }
export default commandRouteDefinition
