#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [--tool amp|claude|codex] [max_iterations]

set -euo pipefail

# Ensure npm global binaries are in PATH (needed in devcontainers)
export PATH="${PATH}:/usr/local/share/npm-global/bin"

TOOL="amp" # Default to amp for backwards compatibility
MAX_ITERATIONS=10

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool)
      TOOL="$2"
      shift 2
      ;;
    --tool=*)
      TOOL="${1#*=}"
      shift
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        MAX_ITERATIONS="$1"
      fi
      shift
      ;;
  esac
done

if [[ "$TOOL" != "amp" && "$TOOL" != "claude" && "$TOOL" != "codex" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp', 'claude', or 'codex'."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"
SHARED_PROMPT_FILE="$SCRIPT_DIR/shared-contract.md"

case "$TOOL" in
  amp)
    TOOL_PROMPT_FILE="$SCRIPT_DIR/amp.prompt.md"
    ;;
  claude)
    TOOL_PROMPT_FILE="$SCRIPT_DIR/claude.prompt.md"
    ;;
  codex)
    TOOL_PROMPT_FILE="$SCRIPT_DIR/codex.prompt.md"
    ;;
esac

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Error: Required command '$command_name' is not available in PATH."
    exit 1
  fi
}

ensure_file() {
  local file_path="$1"

  if [[ ! -f "$file_path" ]]; then
    echo "Error: Required file '$file_path' does not exist."
    exit 1
  fi
}

render_prompt() {
  cat "$SHARED_PROMPT_FILE" "$TOOL_PROMPT_FILE"
}

run_amp_iteration() {
  render_prompt | amp --dangerously-allow-all 2>&1 | tee /dev/stderr || true
}

run_claude_iteration() {
  render_prompt | claude --dangerously-skip-permissions --print 2>&1 | tee /dev/stderr || true
}

run_codex_iteration() {
  local last_message_file
  local output
  local -a codex_args

  last_message_file="$(mktemp)"
  codex_args=(
    exec
    --ephemeral
    --color
    never
    --skip-git-repo-check
    -C
    "$REPO_ROOT"
    -o
    "$last_message_file"
  )

  if [[ "${DEVCONTAINER:-}" == "true" ]]; then
    codex_args+=(
      --dangerously-bypass-approvals-and-sandbox
      -c
      'mcp_servers.filesystem.args=["-y","@modelcontextprotocol/server-filesystem","/workspace/"]'
    )
  else
    codex_args+=(
      --sandbox
      workspace-write
    )
  fi

  codex_args+=(-)

  output="$(render_prompt | codex "${codex_args[@]}" 2>&1 | tee /dev/stderr)" || true

  if [[ -s "$last_message_file" ]]; then
    cat "$last_message_file"
  else
    printf "%s" "$output"
  fi

  rm -f "$last_message_file"
}

ensure_file "$PRD_FILE"
ensure_file "$SHARED_PROMPT_FILE"
ensure_file "$TOOL_PROMPT_FILE"
require_command jq

case "$TOOL" in
  amp)
    require_command amp
    ;;
  claude)
    require_command claude
    ;;
  codex)
    require_command codex
    ;;
esac

if [[ -f "$PRD_FILE" && -f "$LAST_BRANCH_FILE" ]]; then
  CURRENT_BRANCH="$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")"
  LAST_BRANCH="$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")"

  if [[ -n "$CURRENT_BRANCH" && -n "$LAST_BRANCH" && "$CURRENT_BRANCH" != "$LAST_BRANCH" ]]; then
    DATE="$(date +%Y-%m-%d)"
    FOLDER_NAME="$(echo "$LAST_BRANCH" | sed 's|^ralph/||')"
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [[ -f "$PRD_FILE" ]] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [[ -f "$PROGRESS_FILE" ]] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"

    echo "# Ralph Progress Log" >"$PROGRESS_FILE"
    echo "Started: $(date)" >>"$PROGRESS_FILE"
    echo "---" >>"$PROGRESS_FILE"
  fi
fi

CURRENT_BRANCH="$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")"
if [[ -n "$CURRENT_BRANCH" ]]; then
  echo "$CURRENT_BRANCH" >"$LAST_BRANCH_FILE"
fi

if [[ ! -f "$PROGRESS_FILE" ]]; then
  echo "# Ralph Progress Log" >"$PROGRESS_FILE"
  echo "Started: $(date)" >>"$PROGRESS_FILE"
  echo "---" >>"$PROGRESS_FILE"
fi

cd "$REPO_ROOT"

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

for i in $(seq 1 "$MAX_ITERATIONS"); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
  echo "==============================================================="

  case "$TOOL" in
    amp)
      OUTPUT="$(run_amp_iteration)"
      ;;
    claude)
      OUTPUT="$(run_claude_iteration)"
      ;;
    codex)
      OUTPUT="$(run_codex_iteration)"
      ;;
  esac

  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
