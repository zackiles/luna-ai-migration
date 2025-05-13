#!/bin/bash
set -e

# Display usage information
usage() {
  echo "Usage: main.sh lint <old-codebase|new-codebase|all>"
  echo "Lint code in the specified codebase"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Lint Node.js codebase using pnpm"
  echo "  new-codebase    Lint Deno codebase"
  echo "  all             Lint all codebases (default if no argument provided)"
  exit 1
}

# Check if help was requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

TARGET=$1

if [ "$TARGET" == "old-codebase" ]; then
  echo "Linting old-codebase (Node.js)..."
  (cd old-codebase && pnpm run lint)
elif [ "$TARGET" == "new-codebase" ]; then
  echo "Linting new-codebase (Deno 2)..."
  (cd new-codebase && deno task lint)
elif [ -z "$TARGET" ] || [ "$TARGET" == "all" ]; then
  echo "Linting all codebases..."
  (cd old-codebase && pnpm run lint) && \
  (cd new-codebase && deno task lint)
else
  echo "Error: Invalid target '$TARGET'"
  usage
fi 
