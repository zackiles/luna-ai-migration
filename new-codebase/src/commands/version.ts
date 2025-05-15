import type { CommandDefinition, CommandContext } from '../utils/command-router.ts'
import logger from '../utils/logger.ts'
import { getConfig } from '../config.ts'

const config = await getConfig()

const commandRouteDefinition: CommandDefinition = {
	name: 'version',
	command: command,
	description: 'Show version',
};

function command({ _routes }: CommandContext): void {
	logger.print(`${config.PROJECT_VERSION}`)
}

export { commandRouteDefinition, command }
export default commandRouteDefinition
