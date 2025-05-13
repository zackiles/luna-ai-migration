#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# Display usage information
usage() {
  echo "Usage: main.sh dev <old-codebase|new-codebase>"
  echo "Start development server for the specified codebase"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Start Node.js development server using pnpm"
  echo "  new-codebase    Start Deno development server"
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
  echo "Starting dev server for old-codebase (Node.js)..."
  (cd old-codebase && pnpm run dev)
elif [ "$TARGET" == "new-codebase" ]; then
  echo "Starting dev server for new-codebase (Deno 2)..."
  (cd new-codebase && deno task dev)
else
  echo "Error: Invalid target '$TARGET'"
  usage
fi 
