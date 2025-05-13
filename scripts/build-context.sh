#!/bin/bash
set -e

# Display usage information
usage() {
  echo "Usage: main.sh build-context <old-codebase|new-codebase|all>"
  echo "Create an AI-friendly context file using repomix for the specified codebase"
  echo "Output is saved to .ai/context/ directory"
  echo ""
  echo "Arguments:"
  echo "  old-codebase    Build context for old-codebase (Node.js)"
  echo "  new-codebase    Build context for new-codebase (Deno)"
  echo "  all             Build context for both codebases (default if no argument provided)"
  exit 1
}

# Check if help was requested
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

# Default to "all" if no argument is provided
TARGET=${1:-all}

# Ensure the output directory exists
mkdir -p .ai/context

# Run repomix for the specified codebase(s)
case $TARGET in
  old-codebase)
    echo "Building context for old-codebase..."
    repomix --config old-codebase/repomix.config.json
    ;;
  new-codebase)
    echo "Building context for new-codebase..."
    repomix --config new-codebase/repomix.config.json
    ;;
  all)
    echo "Building context for old-codebase..."
    repomix --config old-codebase/repomix.config.json
    echo "Building context for new-codebase..."
    repomix --config new-codebase/repomix.config.json
    ;;
  *)
    echo "Error: Invalid target '$TARGET'"
    usage
    ;;
esac

echo "Context build complete."
