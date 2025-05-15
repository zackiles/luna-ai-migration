/**
 * @module config
 *
 * Configuration management module that provides a flexible way to load and access configuration values
 *
 * CONFIGURATION SOURCES: Configuration values can come from multiple optional sources, loaded in this order
 * (highest to lowest precedence):
 * 1. Command line arguments (--workspace, etc.)
 * 2. Values from config argument passed to initConfig
 * 3. Values from Deno.env environment variables with the CONFIG_PREFIX
 * 4. Default values
 */

import { parseArgs } from '@std/cli'
import { dirname } from '@std/path'
import { findPackagePathFromPath } from './utils/package-info.ts'

const CONFIG_SUFFIX = 'PROJECT_'
// Singleton config instance
let configInstance: ProjectConfig | null = null
// Shared initialization promise to ensure one-time initialization
let initPromise: Promise<ProjectConfig> | null = null

// Finds this binary or project directory, both locally and remotely by searching for the nearest deno.jsonc
// NOTE: for deno compile binaries, this will be the directory of the deno executable and deno.jsonc **MUST** be an embedded resource
const projectPath = async () => dirname(await findPackagePathFromPath())

// Default configuration values
const DEFAULT_VALUES = {
  PROJECT_NAME: 'New-Codebase',
  PROJECT_VERSION: '0.0.1',
  PROJECT_DESCRIPTION: 'A new AI codebase for Deno',
  PROJECT_GITHUB_REPO: 'zackiles/new-codebase',
  PROJECT_CONFIG_FILE_NAME: 'new-codebase.json',
  PROJECT_ENV: Deno.env.get('DENO_ENV') || 'production',
  PROJECT_LOG_LEVEL: 'info',
  PROJECT_WORKSPACE_PATH: Deno.cwd(),
  PROJECT_DISABLED_COMMANDS: 'example', //  disabled because 'example' is the example/template command
  PROJECT_PATH: projectPath
}

/**
 * @module types
 * @description Core type definitions for the deno-kit library
 */

/**
 * Configuration interface representing all environment variables used in deno-kit
 */
interface ProjectConfig {
  PROJECT_NAME: string
  PROJECT_VERSION: string
  /** Description of the project */
  PROJECT_DESCRIPTION: string
  /** Current execution environment (development, production, or test) */
  PROJECT_ENV: string
  /** GitHub repository name (e.g., "zackiles/deno-kit") */
  PROJECT_GITHUB_REPO: string
  /** Name of the workspace config file (e.g., "kit.json") */
  PROJECT_CONFIG_FILE_NAME: string
  /** Path to the project's main module or CLI executable */
  PROJECT_PATH: string
  /** Comma-separated list of disabled commands. This is helpful when Deno-Kit is used in MCP Servers that need to limit tool calls/commands */
  PROJECT_DISABLED_COMMANDS: string
  /** Path to the workspace (the directory the CLI is managing for the user) directory */
  PROJECT_WORKSPACE_PATH: string
  /** Log level for controlling verbosity (DEBUG, INFO, WARN, ERROR, SILENT) */
  PROJECT_LOG_LEVEL: string
}

/**
 * Ensures an object matches the ProjectConfig interface
 * @param config The object to validate
 * @returns True if valid, throws error if invalid
 * @throws {Error} with details about missing required configuration
 */
function assertProjectConfig(config: unknown): config is ProjectConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be a non-null object')
  }

  const requiredKeys: (keyof ProjectConfig)[] = [
    'PROJECT_NAME',
    'PROJECT_DESCRIPTION',
    'PROJECT_VERSION',
    'PROJECT_PATH',
    'PROJECT_GITHUB_REPO',
    'PROJECT_CONFIG_FILE_NAME',
    'PROJECT_DISABLED_COMMANDS',
    'PROJECT_ENV',
    'PROJECT_WORKSPACE_PATH',
    'PROJECT_LOG_LEVEL',
  ]

  const missingKeys = requiredKeys.filter((key) =>
    !(key in config) ||
    typeof (config as Record<string, unknown>)[key] !== 'string' ||
    (config as Record<string, unknown>)[key] === ''
  )

  if (missingKeys.length > 0) {
    throw new Error(
      `Invalid configuration: missing or invalid required fields:\n${missingKeys.join('\n')}`,
    )
  }

  return true
}
/**
 * Resolves all async values in the config object
 */
async function resolveAsyncValues(
  config: Record<string, unknown>,
): Promise<Record<string, string>> {
  // Process all entries in parallel with functional approach
  const entries = await Promise.all(
    Object.entries(config).map(async ([key, value]) => {
      try {
        // Resolve all functions and promises or return the plain value
        const resolved = await (
          typeof value === 'function'
            ? Promise.resolve(value()).then((result) => result instanceof Promise ? result : result)
            : value instanceof Promise
            ? value
            : Promise.resolve(value)
        )

        // Filter invalid values by returning null
        return (resolved !== null && resolved !== undefined && resolved !== '')
          ? [key, String(resolved)]
          : null
      } catch {
        return null
      }
    }),
  )

  // Return the object of resolved values but with keys removed that have null values
  return Object.fromEntries(entries.filter(Boolean) as [string, string][])
}

/**
 * Creates parse options for command line arguments based on config keys.
 * Converts internal config keys (e.g., PROJECT_WORKSPACE_PATH) to kebab-case
 * argument names (e.g., workspace-path) for parseArgs.
 */
function createParseOptions(
  config: Record<string, string>,
): { string: string[]; alias: Record<string, string> } {
  return Object.keys(config)
    .filter((key) => key.startsWith(CONFIG_SUFFIX))
    .reduce((options, key) => {
      const baseName = key.replace(CONFIG_SUFFIX, '') // e.g., WORKSPACE_PATH
      const argName = baseName.toLowerCase().replace(/_/g, '-') // e.g., workspace-path
      options.string.push(argName)
      return options
    }, { string: [] as string[], alias: {} as Record<string, string> })
}

/**
 * Initializes configuration with default values, environment variables,
 * provided config argument, and command line arguments
 *
 * @param config Optional partial configuration to override defaults
 * @returns Complete ProjectConfig object
 */
async function initConfig(config: Partial<ProjectConfig> = {}): Promise<ProjectConfig> {
  // Start with defaults and resolve any async values
  const foundConfig = await resolveAsyncValues(DEFAULT_VALUES)

  // Add environment variables with CONFIG_SUFFIX suffix
  const envFilter = ([key, value]: [string, string]) =>
    key.startsWith(CONFIG_SUFFIX) && value !== '' && value != null

  for (const [key, value] of Object.entries(Deno.env.toObject()).filter(envFilter)) {
    foundConfig[key] = value
  }

  // Add configuration passed to this function (e.g., from setConfig)
  if (config) {
    const configFilter = ([_, value]: [string, unknown]) => value !== '' && value != null

    for (const [key, value] of Object.entries(config).filter(configFilter)) {
      foundConfig[key] = String(value)
    }
  }

  // Process command line arguments with highest precedence
  try {
    const parseOptions = createParseOptions(foundConfig) // Use foundConfig to know what args to look for
    const args = parseArgs(Deno.args, parseOptions)

    const argsFilter = ([key, value]: [string, unknown]) =>
      key !== '_' && key !== '--' && // Standard ignored keys from parseArgs
      typeof value === 'string' && value !== ''

    for (const [parsedArgKey, value] of Object.entries(args).filter(argsFilter)) {
      // Convert parsed arg key (kebab-case, e.g., "workspace-path")
      // back to internal config key format (PROJECT_WORKSPACE_PATH)
      const snakeCaseKey = parsedArgKey.replace(/-/g, '_')
      const internalConfigKey = `${CONFIG_SUFFIX}${snakeCaseKey.toUpperCase()}`
      foundConfig[internalConfigKey] = value as string
    }
  } catch (_err) {
    // Silently fail if argument parsing fails, or log if needed
    // console.error("Failed to parse command line arguments:", e);
  }

  // Validate the config
  try {
    assertProjectConfig(foundConfig)
    return foundConfig as unknown as ProjectConfig
  } catch (err) {
    throw new Error(
      `Configuration initialization failed: ${
        err instanceof Error ? err.message : 'Unknown error'
      }`,
    )
  }
}

/**
 * Gets the current configuration or initializes it if it doesn't exist
 * Uses a shared promise to ensure one-time initialization across multiple calls
 *
 * @returns The current configuration
 */
async function getConfig(): Promise<ProjectConfig> {
  if (!initPromise) {
    initPromise = initConfig()
  }
  return await initPromise
}

/**
 * Sets or initializes the configuration.
 * This function is idempotent within its module scope: once config is initialized,
 * subsequent calls (to the same module instance) return the existing config.
 * Tests using `resetConfigSingleton` get a fresh module scope, allowing re-initialization.
 *
 * @param configUpdates Optional partial configuration to override defaults/previous values.
 * @returns The ProjectConfig object.
 */
async function setConfig(configUpdates: Partial<ProjectConfig> = {}): Promise<ProjectConfig> {
  // If configInstance is already set for this module scope, it means initConfig has run.
  // Return the existing instance to ensure idempotency for this module's setConfig.
  if (configInstance) {
    return configInstance
  }

  // If no initPromise exists (or it was nulled, e.g. by a test environment that resets module state),
  // start the initialization. This also handles the first call in a given module scope.
  // initPromise ensures that initConfig is called only once even if setConfig is called multiple times concurrently.
  if (!initPromise) {
    initPromise = initConfig(configUpdates) // Deno.args are picked up here
  }

  configInstance = await initPromise
  return configInstance
}

export type { ProjectConfig }
export { getConfig, setConfig }
