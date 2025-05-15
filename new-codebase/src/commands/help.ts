import { dedent } from '@qnighy/dedent'
import { bold, dim  } from '@std/fmt/colors'
import type { CommandDefinition, CommandContext } from '../utils/command-router.ts'
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
    ${bold(config.PROJECT_NAME)} - ${dim(config.PROJECT_DESCRIPTION)}
    ${bold('Environment:')} ${dim(config.PROJECT_ENV)}
    ${bold('Version:')} ${dim(config.PROJECT_VERSION)}

    ${bold('Usage:')}
      ${dim(config.PROJECT_NAME)} [command] [options]

    Commands:
    ${routes.map((cmd) => `  ${cmd.name.padEnd(10)} ${cmd.description}`).join("\n")}`
  )
}

export { commandRouteDefinition, command }
export default commandRouteDefinition
