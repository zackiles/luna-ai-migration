#!/bin/bash
set -e

# Display usage information
usage() {
  echo "Usage: main.sh install <old-codebase|new-codebase> [--dev|-D] [package1 package2 ...]"
  echo "Install dependencies for the specified codebase"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Install for Node.js codebase using pnpm"
  echo "  new-codebase    Install for Deno codebase"
  echo ""
  echo "Options:"
  echo "  --dev, -D       Install as development dependencies"
  echo ""
  echo "Examples:"
  echo "  main.sh install old-codebase              Install all dependencies"
  echo "  main.sh install old-codebase lodash       Install specific package"
  echo "  main.sh install old-codebase -D jest      Install as dev dependency"
  echo "  main.sh install new-codebase npm:lodash   Install npm package in Deno"
  exit 1
}

# Check if help was requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

if [ "$#" -lt 1 ]; then
  echo "Error: Missing target codebase argument"
  usage
fi

TARGET=$1
shift

# Validate target
if [ "$TARGET" != "old-codebase" ] && [ "$TARGET" != "new-codebase" ]; then
  echo "Error: Invalid target '$TARGET'. Must be 'old-codebase' or 'new-codebase'."
  usage
fi

PACKAGES=()
IS_DEV=0

# Parse arguments
while (( "$#" )); do
  case "$1" in
    -D|--dev)
      IS_DEV=1
      shift
      ;;
    -*) # unsupported flags
      echo "Error: Unsupported flag $1" >&2
      usage
      ;;
    *) # preserve positional arguments (packages)
      if [[ "$1" == -* && ${#PACKAGES[@]} -gt 0 ]]; then 
          echo "Error: Flags must precede package names if packages are specified. Unexpected flag: $1" >&2
          usage
      fi
      PACKAGES+=("$1")
      shift
      ;;
  esac
done

if [ "$TARGET" == "old-codebase" ]; then
  if [ ${#PACKAGES[@]} -eq 0 ]; then
    echo "Installing all dependencies for old-codebase (pnpm)..."
    (cd old-codebase && pnpm install)
  else
    echo "Adding packages to old-codebase (pnpm): ${PACKAGES[*]}"
    CMD_ARGS=()
    if [ "$IS_DEV" -eq 1 ]; then
      CMD_ARGS+=("-D")
    fi
    (cd old-codebase && pnpm add "${CMD_ARGS[@]}" "${PACKAGES[@]}")
  fi
elif [ "$TARGET" == "new-codebase" ]; then
  if [ ${#PACKAGES[@]} -eq 0 ]; then
    echo "Caching dependencies for new-codebase (Deno)..."
    # Assuming src/main.ts is a common entry point, as seen in deno.jsonc tasks
    (cd new-codebase && deno cache src/main.ts --no-check)
  else
    echo "Adding packages to new-codebase (Deno): ${PACKAGES[*]}"
    CMD_ARGS=()
    if [ "$IS_DEV" -eq 1 ]; then
      # Note: --dev for 'deno add' primarily affects package.json if used.
      CMD_ARGS+=("--dev")
    fi
    (cd new-codebase && deno add "${CMD_ARGS[@]}" "${PACKAGES[@]}")
  fi
fi

echo "Dependency installation/update complete for $TARGET codebase." 
