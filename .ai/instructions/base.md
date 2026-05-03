# AI Instructions

Shared instructions for all AI agents (Claude Code, Codex, etc.).

## Skills

Skills are located in `.ai/skills/`. Each platform symlinks its own directory:
- Claude Code: `.claude/skills/` → `.ai/skills/`
- Codex / other agents: `.agents/skills/` → `.ai/skills/`

## Setup

Run `.ai/scripts/sync-ai-shims.sh` after cloning to recreate platform symlinks.
