#!/bin/bash
set -e

SCRIPT_DIR="scripts"

# Function to display usage information
usage() {
  echo "Usage: $0 <command> [options_and_args_for_command]"
  echo ""
  echo "This script acts as a proxy to other scripts located in the '$SCRIPT_DIR/' directory."
  echo ""
  echo "Available commands:"
  echo ""
  echo "  dev [old-codebase|new-codebase]"
  echo "      Start development server for specified codebase"
  echo ""
  echo "  build [old-codebase|new-codebase]"
  echo "      Build specified codebase"
  echo ""
  echo "  format [old-codebase|new-codebase|all]"
  echo "      Format code in specified codebase"
  echo ""
  echo "  lint [old-codebase|new-codebase|all]"
  echo "      Run linter on specified codebase"
  echo ""
  echo "  install <old-codebase|new-codebase> [--dev|-D] [package1 package2 ...]"
  echo "      Install dependencies for specified codebase"
  echo "      If no packages provided, installs all dependencies"
  echo "      Use --dev|-D to install as development dependencies"
  echo ""
  echo "  remove <old-codebase|new-codebase> [--dev|-D] <package1> [package2 ...]"
  echo "      Remove dependencies from specified codebase"
  echo "      At least one package must be specified"
  echo "      Use --dev|-D to remove from development dependencies only"
  echo ""
  echo "  build-context [old-codebase|new-codebase|all]"
  echo "      Create AI-friendly XML file containing all code from the specified codebase"
  echo "      Output is saved to .ai/context/ directory"
  echo "      Default is 'all' if no argument provided"
  echo ""
  echo "Examples:"
  echo "  $0 dev new-codebase"
  echo "    Start development server for new-codebase (Deno)"
  echo ""
  echo "  $0 install old-codebase --dev lodash"
  echo "    Install lodash as dev dependency for old-codebase (Node.js)"
  echo ""
  echo "  $0 format all"
  echo "    Format code in all codebases"
  echo ""
  echo "  $0 build-context all"
  echo "    Create AI context files for both codebases in .ai/context/"
  exit 1
}

# Check if help parameter was provided
if [ "$1" == "help" ] || [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  usage
fi

# Check if any arguments are provided
if [ "$#" -lt 1 ]; then
  echo "Error: No command specified."
  usage
fi

COMMAND=$1
shift # Remove the command name from the arguments list, the rest are for the target script

TARGET_SCRIPT="$SCRIPT_DIR/$COMMAND.sh"

# Check if the target script exists and is executable
if [ -f "$TARGET_SCRIPT" ] && [ -x "$TARGET_SCRIPT" ]; then
  # Execute the target script, passing all remaining arguments
  "$TARGET_SCRIPT" "$@"
else
  echo "Error: Command '$COMMAND' not found, or script '$TARGET_SCRIPT' is not executable or does not exist."
  echo ""
  usage
fi 
