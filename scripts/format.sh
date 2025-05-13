#!/bin/bash
set -e

# Display usage information
usage() {
  echo "Usage: main.sh format <old-codebase|new-codebase|all>"
  echo "Format code in the specified codebase"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Format Node.js codebase using pnpm"
  echo "  new-codebase    Format Deno codebase"
  echo "  all             Format all codebases (default if no argument provided)"
  exit 1
}

# Check if help was requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

TARGET=$1

if [ "$TARGET" == "old-codebase" ]; then
  echo "Formatting old-codebase (Node.js)..."
  (cd old-codebase && pnpm run format)
elif [ "$TARGET" == "new-codebase" ]; then
  echo "Formatting new-codebase (Deno 2)..."
  (cd new-codebase && deno task format)
elif [ -z "$TARGET" ] || [ "$TARGET" == "all" ]; then
  echo "Formatting all codebases..."
  (cd old-codebase && pnpm run format)
  (cd new-codebase && deno task format)
else
  echo "Error: Invalid target '$TARGET'"
  usage
fi 
