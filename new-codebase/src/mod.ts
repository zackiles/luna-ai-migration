/**
 * @module mod
 *
 * Main entry point for the package.
 */
import cli from './cli.ts'
import logger from './utils/logger.ts'
import { getConfig } from './config.ts'
import gracefulShutdown from './utils/graceful-shutdown.ts'

const config = await getConfig()

logger.setConfig({
  //level: config.PROJECT_LOG_LEVEL,
  colors: true,
  timestamp: false,
  name: config.PROJECT_NAME,
})

if (import.meta.main) {
  await gracefulShutdown.startAndWrap(cli, logger)
}
