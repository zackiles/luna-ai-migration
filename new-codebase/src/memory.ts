/**
 * @module memory
 * @description Memory management for ${config.APP_NAME} CLI
 * Loads ${config.APP_NAME.toUpperCase()}.md files (workspace shared), ${config.APP_NAME.toUpperCase()}.local.md (workspace personal),
 * and ~/.${config.APP_NAME.toLowerCase()}/${config.APP_NAME.toUpperCase()}.md (global user memory).
 */

import { join } from '@std/path'
import { exists } from '@std/fs'
import logger from './utils/logger.ts'
import { getConfig } from './config.ts'

const config = await getConfig()

/**
 * Transform project name into a valid filename
 * @param projectName The original project name
 * @param options Optional configuration for filename transformation
 * @returns A sanitized filename suitable for file system use
 */
const toFileName = (
  projectName: string, 
  options: { 
    uppercase?: boolean, 
    extension?: string 
  } = {}
): string => {
  // Remove any non-alphanumeric characters and replace with hyphen
  const sanitized = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Trim leading and trailing hyphens
    .replace(/^-+|-+$/g, '')

  // Apply uppercase if specified
  const formatted = options.uppercase 
    ? sanitized.toUpperCase() 
    : sanitized

  // Add extension if provided
  return options.extension 
    ? `${formatted}.${options.extension}` 
    : formatted
}

/**
 * Memory file types
 */
export enum MemoryFileType {
  WORKSPACE = 'workspace',
  WORKSPACE_LOCAL = 'workspace-local',
  USER = 'user',
}

/**
 * Memory file entry
 */
export type MemoryFile = {
  type: MemoryFileType
  path: string
  content: string
  exists: boolean
}

/**
 * Memory manager for ${config.APP_NAME} CLI
 */
class Memory {
  private baseDir: string
  private memoryFiles: Map<MemoryFileType, MemoryFile> = new Map()
  private combinedMemory = ''

  /**
   * Create a new memory manager
   * @param baseDir Base directory for project memory files (usually cwd)
   */
  constructor(baseDir: string = Deno.cwd()) {
    this.baseDir = baseDir
    this.initializeMemoryFiles()
  }

  /**
   * Initialize memory file paths
   */
  private initializeMemoryFiles(): void {
    // Workspace memory files
    this.memoryFiles.set(MemoryFileType.WORKSPACE, {
      type: MemoryFileType.WORKSPACE,
      path: join(this.baseDir, `${toFileName(config.APP_NAME, { uppercase: true, extension: 'md' })}`),
      content: '',
      exists: false,
    })

    this.memoryFiles.set(MemoryFileType.WORKSPACE_LOCAL, {
      type: MemoryFileType.WORKSPACE_LOCAL,
      path: join(this.baseDir, `${toFileName(config.APP_NAME, { uppercase: true, extension: 'local.md' })}`),
      content: '',
      exists: false,
    })

    // User global memory file in ~/.{project-name}/{project-name}.md
    const homeDir = Deno.env.get('HOME') || Deno.env.get('USERPROFILE') || '.'
    this.memoryFiles.set(MemoryFileType.USER, {
      type: MemoryFileType.USER,
      path: join(homeDir, `.${toFileName(config.APP_NAME)}`, `${toFileName(config.APP_NAME, { uppercase: true, extension: 'md' })}`),
      content: '',
      exists: false,
    })
  }

  /**
   * Load all memory files
   */
  async loadAll(): Promise<void> {
    try {
      for (const [type, file] of this.memoryFiles.entries()) {
        try {
          const fileExists = await exists(file.path)

          if (fileExists) {
            const content = await Deno.readTextFile(file.path)
            this.memoryFiles.set(type, {
              ...file,
              content,
              exists: true,
            })
            logger.debug(`Loaded memory file: ${file.path}`)
          } else {
            logger.debug(`Memory file not found: ${file.path}`)
          }
        } catch (error) {
          logger.debug(`Error reading memory file ${file.path}: ${error}`)
        }
      }

      this.combinedMemory = this.combineMemoryContent()
    } catch (error) {
      logger.error(`Error loading memory files: ${error}`)
    }
  }

  /**
   * Combine memory content from all files
   * @returns Combined memory content
   */
  private combineMemoryContent(): string {
    let combined = ''

    // Order: user global, workspace shared, workspace local
    const userMemory = this.memoryFiles.get(MemoryFileType.USER)
    const workspaceMemory = this.memoryFiles.get(MemoryFileType.WORKSPACE)
    const workspaceLocalMemory = this.memoryFiles.get(MemoryFileType.WORKSPACE_LOCAL)

    if (userMemory?.exists && userMemory.content) {
      combined += `# User Global Memory\n${userMemory.content}\n\n`
    }

    if (workspaceMemory?.exists && workspaceMemory.content) {
      combined += `# Workspace Memory\n${workspaceMemory.content}\n\n`
    }

    if (workspaceLocalMemory?.exists && workspaceLocalMemory.content) {
      combined += `# Workspace Local Memory\n${workspaceLocalMemory.content}\n\n`
    }

    return combined.trim()
  }

  /**
   * Add a new memory entry
   * @param content Content to add to memory
   * @param type Type of memory file to add to
   * @returns True if successfully added
   */
  async addMemory(content: string, type: MemoryFileType): Promise<boolean> {
    const file = this.memoryFiles.get(type)
    if (!file) {
      logger.error(`Unknown memory file type: ${type}`)
      return false
    }

    try {
      // Create directory if it doesn't exist
      const dirPath = file.path.substring(0, file.path.lastIndexOf('/'))
      try {
        await Deno.mkdir(dirPath, { recursive: true })
      } catch {
        // Directory may already exist, continue
      }

      // Append to file if it exists, otherwise create it
      const newContent = file.exists
        ? `${file.content}\n- ${content}`
        : `# ${toFileName(config.APP_NAME, { uppercase: true })} Memory File\n\n- ${content}`

      await Deno.writeTextFile(file.path, newContent)

      // Update our memory cache
      this.memoryFiles.set(type, {
        ...file,
        content: newContent,
        exists: true,
      })

      // Rebuild combined memory
      this.combinedMemory = this.combineMemoryContent()

      logger.info(`Added memory to ${file.path}`)
      return true
    } catch (error) {
      logger.error(`Error adding memory to ${file.path}: ${error}`)
      return false
    }
  }

  /**
   * Get memory content
   * @returns Combined memory content from all sources
   */
  getMemory(): string {
    return this.combinedMemory
  }

  /**
   * Get all memory files
   * @returns Map of memory files
   */
  getMemoryFiles(): Map<MemoryFileType, MemoryFile> {
    return this.memoryFiles
  }

  /**
   * Open a memory file in default editor
   * @param type Type of memory file to open
   * @returns Whether file was successfully opened
   */
  async openInEditor(type: MemoryFileType): Promise<boolean> {
    const file = this.memoryFiles.get(type)
    if (!file) {
      logger.error(`Unknown memory file type: ${type}`)
      return false
    }

    try {
      // Use $EDITOR or fall back to common editors
      const editor = Deno.env.get('EDITOR') || 'nano'

      // Create file if it doesn't exist
      if (!file.exists) {
        const dirPath = file.path.substring(0, file.path.lastIndexOf('/'))
        try {
          await Deno.mkdir(dirPath, { recursive: true })
        } catch {
          // Directory may already exist, continue
        }

        await Deno.writeTextFile(file.path, `# ${toFileName(config.APP_NAME, { uppercase: true })} Memory File\n\n`)

        this.memoryFiles.set(type, {
          ...file,
          content: `# ${toFileName(config.APP_NAME, { uppercase: true })} Memory File\n\n`,
          exists: true,
        })
      }

      // Open in editor
      const process = new Deno.Command(editor, {
        args: [file.path],
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      })

      const { code } = await process.output()

      if (code === 0) {
        // Reload the file after editing
        const content = await Deno.readTextFile(file.path)
        this.memoryFiles.set(type, {
          ...file,
          content,
          exists: true,
        })

        // Rebuild combined memory
        this.combinedMemory = this.combineMemoryContent()

        logger.info(`Edited memory file: ${file.path}`)
        return true
      }

      logger.error(`Editor exited with non-zero code: ${code}`)
      return false
    } catch (error) {
      logger.error(`Error opening memory file in editor: ${error}`)
      return false
    }
  }

  /**
   * Initialize a new ${config.APP_NAME.toUpperCase()}.md file for workspace
   * @param content Content to initialize the file with (if not provided, a default template is used)
   * @returns Whether file was successfully created
   */
  async initializeWorkspaceMemory(content?: string): Promise<boolean> {
    const file = this.memoryFiles.get(MemoryFileType.WORKSPACE)
    if (!file) {
      return false
    }

    // If file already exists, prompt before overwriting
    if (file.exists) {
      logger.warn(`Workspace memory file already exists: ${file.path}`)
      return false
    }

    try {
      const defaultContent = content || [
        `# ${toFileName(config.APP_NAME, { uppercase: true })} Workspace Memory`,
        '',
        `This file contains workspace-specific information for ${config.APP_NAME}, an AI coding assistant.`,
        '',
        '## Workspace Overview',
        '',
        '- Workspace name: [Workspace Name]',
        '- Description: [Brief description of what this workspace does]',
        '- Tech stack: [List main technologies, libraries, frameworks]',
        '',
        '## Conventions',
        '',
        '- Code style: [e.g., Use 2-space indentation, camelCase for variables]',
        '- Documentation: [e.g., JSDoc for functions, module header comments]',
        '- Testing: [e.g., Unit tests with Deno.test]',
        '',
        '## Important Notes',
        '',
        '- [Add any special instructions or notes for working with this workspace]',
        '',
      ].join('\n')

      await Deno.writeTextFile(file.path, defaultContent)

      this.memoryFiles.set(MemoryFileType.WORKSPACE, {
        ...file,
        content: defaultContent,
        exists: true,
      })

      // Rebuild combined memory
      this.combinedMemory = this.combineMemoryContent()

      logger.info(`Created workspace memory file: ${file.path}`)
      return true
    } catch (error) {
      logger.error(`Error creating workspace memory file: ${error}`)
      return false
    }
  }
}

export default Memory
