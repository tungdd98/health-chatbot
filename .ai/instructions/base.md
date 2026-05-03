# AI Instructions

Shared instructions for all AI agents (Claude Code, Codex, etc.).

## Directory Structure

All AI agent configuration lives under `.ai/` as the Single Source of Truth.

| `.ai/` path     | Purpose                                              |
|-----------------|------------------------------------------------------|
| `agents/`       | Sub-agent definition files (`.md` with frontmatter) |
| `hooks/`        | Lifecycle hook scripts and hook config JSON          |
| `skills/`       | Skill definitions consumed by all platforms          |
| `instructions/` | Shared instruction docs (this file)                 |
| `scripts/`      | Maintenance scripts (e.g. `sync-ai-shims.sh`)       |

## Platform Symlinks

### Claude Code (`.claude/`)
- `.claude/agents/` → `.ai/agents/`
- `.claude/hooks/`  → `.ai/hooks/`
- `.claude/skills/` → `.ai/skills/`

### Codex / other agents (`.agents/`)
- `.agents/agents/` → `.ai/agents/`
- `.agents/hooks/`  → `.ai/hooks/`
- `.agents/skills/` → `.ai/skills/`

## Setup

Run `.ai/scripts/sync-ai-shims.sh` after cloning to recreate all platform symlinks.
