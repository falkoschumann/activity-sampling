#!/usr/bin/env bash
# Stop hook: runs the full build after Claude finished a task and reports
# failures back so they get fixed before the work is handed over.
set -uo pipefail

input=$(cat)

# The hook already sent Claude back to work once - don't loop.
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# Nothing changed in the working tree - nothing to verify.
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

if output=$(make 2>&1); then
  exit 0
fi

printf '%s' "$output" | tail -n 60 |
  jq -Rs '{decision: "block", reason: ("`make` failed. Fix the errors before finishing:\n\n" + .)}'
