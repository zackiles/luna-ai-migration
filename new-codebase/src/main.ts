/**
 * @module main
 *
 * Main entry point.
 */
import cli from './cli.ts'
import { getConfig } from './config.ts'
import { LogLevel } from './utils/logger.ts'
import logger from './utils/logger.ts'

const config = await getConfig()

logger.setConfig({
  name: config.APP_NAME,
  level: {
    'development': LogLevel.DEBUG,
    'test': LogLevel.WARN,
    'production': LogLevel.INFO,
  }[config.APP_ENV] ?? LogLevel.INFO,
  colors: true,
  timestamp: config.APP_ENV !== 'production',
})

if (import.meta.main) {
  await cli()
}
