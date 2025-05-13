# Migration Project

This project is structured for a migration from Node.js to Deno 2. The objective is to rewrite all code and functionality in `old-codebase/src` to `new-codebase/src` in Deno 2. These projects represent the source code for a CLI.

*   `old-codebase/`: The original Node.js project.
*   `new-codebase/`: The new Deno 2 project.

**DANGER**: NEVER make changes to files in `old-codebase/`. It is READ ONLY, and you're only allow to add or remove dependencies and edit minor configuration in order for you to run and view it properly.

## Global Scripts

Some common development tasks, and migration-specific scripts are shared between the old and new codebase and can be ran via the `main.sh` script in the project root.

1.  **View Available Commands:**
    To see all available tasks and how to use them, run:
    ```bash
    ./main.sh
    ```
    or
    ```bash
    ./main.sh help
    ```

2.  **Initial Setup for `old-codebase`:**
    If working with the Node.js project, install its dependencies:
    ```bash
    ./main.sh install old-codebase
    ```

3.  **Initial Setup for `new-codebase`:**
    To cache dependencies for the Deno project, run:
    ```bash
    ./main.sh install new-codebase
    ```

4.  **Running Tasks:**
    Use `main.sh` followed by the command name and any necessary arguments. For example:
    ```bash
    ./main.sh dev new-codebase
    ./main.sh format old-codebase
    ./main.sh install new-codebase npm:cowsay # Example of adding a specific package
    ./main.sh lint new-codebase # Example of linting
    ./main.sh lint all # Example of linting all codebases
    ```

Refer to the output of `./main.sh` for a full list of commands and their specific usage.

## Project Structure Overview

The main project components are:
*   `main.sh`: Central script for running all tasks, located in the project root.
*   `scripts/`: Directory containing individual task scripts (e.g., `dev.sh`, `lint.sh`, `install.sh`).
*   `old-codebase/`: Contains the Node.js application.
    *   `package.json`: Defines tasks and dependencies for the old codebase.
*   `new-codebase/`: Contains the Deno application.
    *   `deno.jsonc`: Defines tasks and dependencies for the new codebase.
*   `README.md`: This file, providing an overview of the project.

## Project Structure
This is a basic and high-level overview of the project.

```
[project-root]/
├── .git/
├── old-codebase/         # Original Node.js project
│   ├── src/
│   ├── package.json      # Node.js task definitions
│   └── ...
├── new-codebase/         # New Deno 2 project
│   ├── src/              # Deno source (example: main.ts, mod.ts)
│   ├── deno.jsonc        # Deno 2 task definitions
│   └── ...
├── scripts/              # Directory containing individual task scripts
│   ├── dev.sh
│   ├── build.sh
│   ├── format.sh
│   ├── lint.sh
│   ├── install.sh
│   ├── remove.sh
│   └── build-context.sh
├── main.sh               # Central script for running all tasks
└── README.md             # This file
```

## Working with the Codebases

All development tasks should be run from the project root using the `./main.sh` script.

### Running Tasks

The `main.sh` script can target either the `old-codebase`, the `new-codebase`, or `all` (for tasks like `format` and `lint`).

*   **Start Development Server:**
    *   For Node.js: `./main.sh dev old-codebase`
    *   For Deno 2: `./main.sh dev new-codebase`

*   **Build Project:**
    *   For Node.js: `./main.sh build old-codebase`
    *   For Deno 2: `./main.sh build new-codebase` (This runs `deno check --all src/main.ts` as defined in `deno.jsonc`)

*   **Format Code:**
    *   For Node.js: `./main.sh format old-codebase`
    *   For Deno 2: `./main.sh format new-codebase`
    *   For both: `./main.sh format all` (or `./main.sh format`)

*   **Lint Code:**
    *   For Node.js: `./main.sh lint old-codebase`
    *   For Deno 2: `./main.sh lint new-codebase`
    *   For both: `./main.sh lint all`

*   **Build AI Context:**
    *   For Node.js: `./main.sh build-context old-codebase`
    *   For Deno 2: `./main.sh build-context new-codebase`
    *   For both: `./main.sh build-context all` (or `./main.sh build-context`)
    
    The build-context command creates an AI-friendly XML file containing all code from the specified codebase(s) and outputs it to the `.ai/context/` directory, making it easier for AI tools to analyze the codebase.


## NEW Codebase Style Guidelines

- **Formatting**: 2 spaces indentation, 100 char line width, single quotes, no semicolons
- **Imports**: Use `jsr:` specifier for JSR packages, `import type` for types, and `@std/` for Deno standard libraries
- **TypeScript**: Strict type checking, explicit return types, prefer utility types over interfaces
- **Error Handling**: Use `try/catch` for async operations, avoid deeply nested error handling
- **Dependencies**: Use `deno add` to manage dependencies, prefer `@std/` libraries for common tasks
- **File Structure**: Keep files under 250 lines, organize by feature, use `src/` for source code and `test/` for tests
- **Testing**: Use `@std/assert`, descriptive test names, and arrange/act/assert pattern

## New Codebase Naming Conventions

- **kebab-case**: File and folder names
- **PascalCase**: Classes, interfaces, types
- **camelCase**: Variables, functions, methods
- **UPPER_SNAKE_CASE**: Constants
- **Test files**: `[filename].test.ts`
