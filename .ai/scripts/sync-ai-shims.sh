#!/usr/bin/env bash
# Recreate platform symlinks pointing to .ai/ SSOT.
# Run after cloning on a new machine.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

link() {
  local target="$1" link="$2"
  rm -rf "$link"
  ln -s "$target" "$link"
  echo "  linked: $link -> $target"
}

echo "==> Claude Code"
mkdir -p .claude
link ../.ai/skills .claude/skills

echo "==> Codex / other agents"
mkdir -p .agents
link ../.ai/skills .agents/skills

echo "==> Root instruction files"
link .ai/instructions/base.md CLAUDE.md
link .ai/instructions/base.md AGENTS.md

echo "Done."
