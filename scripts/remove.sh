#!/bin/bash
set -e

# Display usage information
usage() {
  echo "Usage: main.sh remove <old-codebase|new-codebase> [--dev|-D] <package1> [package2 ...]"
  echo "Remove dependencies from the specified codebase"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Remove from Node.js codebase using pnpm"
  echo "  new-codebase    Remove from Deno codebase"
  echo ""
  echo "Options:"
  echo "  --dev, -D       Remove only from development dependencies"
  echo ""
  echo "Examples:"
  echo "  main.sh remove old-codebase lodash         Remove specific package"
  echo "  main.sh remove old-codebase -D jest        Remove dev dependency only"
  echo "  main.sh remove new-codebase npm:lodash     Remove npm package from Deno"
  exit 1
}

# Check if help was requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

if [ "$#" -lt 2 ]; then # Target + at least one package
  echo "Error: Missing arguments. Target and at least one package are required."
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

# Parse arguments (flags first, then packages)
while (( "$#" )); do
  if [[ "$1" == "-D" || "$1" == "--dev" ]]; then
    if [ ${#PACKAGES[@]} -gt 0 ]; then # Check if packages have already been added
      echo "Error: Flags must precede package names. Unexpected flag: $1" >&2
      usage
    fi
    IS_DEV=1
    shift
  elif [[ "$1" == -* ]]; then # any other unsupported flags
    if [ ${#PACKAGES[@]} -gt 0 ]; then
      echo "Error: Flags must precede package names. Unexpected flag: $1" >&2
    else
      echo "Error: Unsupported flag $1" >&2
    fi
    usage
  else # preserve positional arguments (packages)
    PACKAGES+=("$1")
    shift
  fi
done

if [ ${#PACKAGES[@]} -eq 0 ]; then
  echo "Error: No packages specified for removal." >&2
  usage
fi

if [ "$TARGET" == "old-codebase" ]; then
  echo "Removing packages from old-codebase (pnpm): ${PACKAGES[*]}"
  CMD_ARGS=()
  if [ "$IS_DEV" -eq 1 ]; then
    CMD_ARGS+=("-D") # pnpm remove -D removes only from devDependencies
  fi
  (cd old-codebase && pnpm remove "${CMD_ARGS[@]}" "${PACKAGES[@]}")

elif [ "$TARGET" == "new-codebase" ]; then
  echo "Removing packages from new-codebase (Deno): ${PACKAGES[*]}"
  CMD_ARGS=()
  if [ "$IS_DEV" -eq 1 ]; then
    # Note: --dev for 'deno remove' primarily affects package.json if used.
    CMD_ARGS+=("--dev")
  fi
  (cd new-codebase && deno remove "${CMD_ARGS[@]}" "${PACKAGES[@]}")
fi

echo "Dependency removal complete for $TARGET codebase." 
