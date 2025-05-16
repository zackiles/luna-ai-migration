import { dedent } from '@qnighy/dedent'
import { bold, dim } from '@std/fmt/colors'
import type { CommandContext, CommandDefinition } from '../utils/command-router.ts'
import logger from '../utils/logger.ts'
import { getConfig } from '../config.ts'

const config = await getConfig()

const commandRouteDefinition: CommandDefinition = {
  name: 'help',
  command: command,
  description: 'Display help menu',
}

function command({ routes }: CommandContext): void {
  logger.print(dedent`\
    ${bold(config.APP_NAME)} - ${dim(config.APP_DESCRIPTION)}
    ${bold('Environment:')} ${dim(config.APP_ENV)}
    ${bold('Version:')} ${dim(config.APP_VERSION)}

    ${bold('Usage:')}
      ${dim(config.APP_NAME)} [command] [options]

    Commands:
    ${routes.map((cmd) => `  ${cmd.name.padEnd(10)} ${cmd.description}`).join('\n')}`)
}

export { command, commandRouteDefinition }
export default commandRouteDefinition
