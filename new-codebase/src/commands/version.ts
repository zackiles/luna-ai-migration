import type { CommandRouteDefinition } from '../utils/command-router.ts'
import logger from '../utils/logger.ts'
import { getConfig } from '../config.ts'

const config = await getConfig()

const commandRouteDefinition: CommandRouteDefinition = {
	name: 'version',
	command: command,
	description: 'Show version',
};

function command(): void {
	logger.print(`${config.PACKAGE_VERSION}`)
}

export { commandRouteDefinition, command }
export default commandRouteDefinition
