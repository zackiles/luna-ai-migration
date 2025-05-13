#!/bin/bash
set -e

# Display usage information
usage() {
  echo "Usage: main.sh build <old-codebase|new-codebase>"
  echo "Build the specified codebase"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Build Node.js codebase using pnpm"
  echo "  new-codebase    Build Deno codebase"
  exit 1
}

# Check if help was requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

TARGET=$1

if [ -z "$TARGET" ]; then
  echo "Error: Missing target codebase argument"
  usage
fi

if [ "$TARGET" == "old-codebase" ]; then
  echo "Building old-codebase (Node.js)..."
  (cd old-codebase && pnpm run build)
elif [ "$TARGET" == "new-codebase" ]; then
  echo "Building new-codebase (Deno 2)..."
  (cd new-codebase && deno task build)
else
  echo "Error: Invalid target '$TARGET'"
  usage
fi 
