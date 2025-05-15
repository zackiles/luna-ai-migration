/**
 * @module mod
 *
 * Main entry point for the package.
 */
import cli from './cli.ts'
import { getConfig } from './config.ts'
import { LogLevel } from './utils/logger.ts'
import logger from './utils/logger.ts'
import gracefulShutdown from './utils/graceful-shutdown.ts'

const config = await getConfig()

logger.setConfig({
  name: config.PROJECT_NAME,
  level: {
    'development': LogLevel.DEBUG,
    'test': LogLevel.WARN,
    'production': LogLevel.INFO
  }[config.PROJECT_ENV] ?? LogLevel.INFO,
  colors: true,
  timestamp: config.PROJECT_ENV !== 'production'
})

if (import.meta.main) {
  await gracefulShutdown.startAndWrap(cli, logger)
}
