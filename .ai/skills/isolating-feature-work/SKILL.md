---
name: isolating-feature-work
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - offers choice between git worktree isolation or simple feature branch checkout
---

# Using Git Worktrees

## Overview

Two modes for starting isolated feature work:

- **Worktree** — separate working directory, work multiple branches simultaneously without switching
- **Feature branch** — simple `checkout -b`, lighter weight, sufficient when one active context is enough

**Core principle:** Use the simplest approach that gives the isolation you need.

**Announce at start:** "I'm using the isolating-feature-work skill to set up an isolated workspace."

## Choose Your Approach

Check CLAUDE.md and AGENTS.md for a preference first. If none, ask the user:

```
Starting isolated workspace for <feature-name>.

Which approach would you prefer?
1. Git worktree (separate directory, current branch stays active in parallel)
2. Feature branch checkout (lightweight, switch context in place)
```

| Prefer worktree when...                   | Prefer feature branch when...                |
| ----------------------------------------- | -------------------------------------------- |
| Need current branch active simultaneously | Only one context needed at a time            |
| Long-running parallel work                | Short or focused feature                     |
| Project already has worktree convention   | Simple personal workflow / no worktree setup |

---

## Path A: Git Worktree

## Directory Selection Process

Follow this priority order:

### 1. Check Existing Directories

```bash
# Check in priority order
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** Use that directory. If both exist, `.worktrees` wins.

### 2. Check CLAUDE.md / AGENTS.md

```bash
grep -i "worktree.*director" CLAUDE.md AGENTS.md 2>/dev/null | head -1
```

**If preference specified:** Use it without asking.

### 3. Default to `.worktrees/`

If no directory exists and no CLAUDE.md / AGENTS.md preference, automatically use `.worktrees/` (no need to ask).

## Safety Verification

### For Project-Local Directories (.worktrees or worktrees)

**MUST verify directory is ignored before creating worktree:**

```bash
# Check if directory is ignored (respects local, global, and system gitignore)
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:**

Add to `.git/info/exclude` (local-only, not committed):

```bash
echo ".worktrees" >> "$(git rev-parse --git-dir)/info/exclude"
```

**Why `.git/info/exclude` over `.gitignore`:** Keeps worktree exclusion private to this machine — no noise in project history, no shared convention forced on teammates.

**Why critical:** Prevents accidentally committing worktree contents to repository.

## Creation Steps

**Check `wtf` availability first** — it is the primary path and handles directory creation, ignore setup, config copying, and dependency install automatically.

### Primary: `wtf` CLI

```bash
# Check if wtf is available
[ -x ~/.local/bin/wtf ] || which wtf 2>/dev/null
```

**If available:**

#### Resolve the branch name first

`wtf` names the worktree directory from the Jira key in the branch name. Determine the branch name **before** calling `wtf create`:

1. **Detect from context**: Scan the user's message and current branch name for a Jira key pattern (`[A-Z]{2,}-[0-9]+`, e.g., `PROJ-123`)
2. **If found**: Format as `<JIRA-KEY>-<feature-description>` (e.g., `PROJ-123-add-dark-mode`)
3. **If not found**: Ask the user before proceeding:

   > "Does this work have a Jira ticket? Provide the key (e.g., `PROJ-123`) so `wtf` can organize the worktree correctly — or press Enter to skip."

4. **If user skips / no key**: Use a plain descriptive name (e.g., `add-dark-mode`)

```bash
wtf create <branch-name>
# Automatically handles:
#   - Creates worktree at .worktrees/<jira-key>/  (or .worktrees/<branch-name>/ if no Jira key)
#   - Adds .worktrees/ to .git/info/exclude
#   - Copies .env, .env.local, config files
#   - Installs dependencies (pnpm → yarn → bun → npm)
```

Skip to "Verify Clean Baseline" below.

### Fallback: Manual Steps

Use only if `wtf` is not available.

#### 1. Detect Project Name

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

#### 2. Create Worktree

```bash
path=".worktrees/$BRANCH_NAME"
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

#### 3. Run Project Setup

Auto-detect and run appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### Verify Clean Baseline

Run tests to ensure worktree starts clean:

```bash
# Examples - use project-appropriate command
npm test
cargo test
pytest
go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready.

### Report Location

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

---

## Path B: Feature Branch Checkout

### 1. Create and Switch Branch

```bash
git checkout -b feature/<branch-name>
```

### 2. Run Project Setup

Same auto-detection as worktree path:

```bash
if [ -f package.json ]; then npm install; fi
if [ -f Cargo.toml ]; then cargo build; fi
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi
if [ -f go.mod ]; then go mod download; fi
```

### 3. Verify Clean Baseline

```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

### 4. Report Ready

```
Branch feature/<name> created and checked out.
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

---

## Quick Reference

**Approach selection:**

| Situation                                  | Recommended    |
| ------------------------------------------ | -------------- |
| Need parallel branches active              | Worktree       |
| Simple single-context feature              | Feature branch |
| CLAUDE.md / AGENTS.md specifies preference | Follow it      |
| No preference →                            | Ask user       |

**Worktree directory (Path A):**

| Situation             | Action                                              |
| --------------------- | --------------------------------------------------- |
| `.worktrees/` exists  | Use it (verify ignored)                             |
| `worktrees/` exists   | Use it (verify ignored)                             |
| Both exist            | Use `.worktrees/`                                   |
| Neither exists        | Check CLAUDE.md / AGENTS.md → default `.worktrees/` |
| Directory not ignored | Add to `.git/info/exclude`                          |
| `wtf` available       | `wtf create` handles ignore + setup automatically   |

**Both paths:**

| Situation                  | Action                  |
| -------------------------- | ----------------------- |
| Tests fail during baseline | Report failures + ask   |
| No package.json/Cargo.toml | Skip dependency install |

## Common Mistakes

### Skipping ignore verification (Path A)

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always use `git check-ignore` before creating project-local worktree; add to `.git/info/exclude` if not ignored

### Assuming directory location (Path A)

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: existing > CLAUDE.md / AGENTS.md > default `.worktrees/`

### Proceeding with failing tests

- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

### Hardcoding setup commands

- **Problem:** Breaks on projects using different tools
- **Fix:** Use `wtf create` (primary) — it auto-detects. Fallback: auto-detect from project files (package.json, etc.)

### Manually running ignore/setup when `wtf` is available

- **Problem:** Redundant work, potential inconsistency
- **Fix:** When `wtf` is available, it handles `.git/info/exclude` and dependency install — skip those manual steps

### Calling `wtf create` without resolving the Jira key (Path A)

- **Problem:** `wtf` names the directory from the Jira key; a plain branch name (e.g., `feature/auth`) creates `.worktrees/feature/` instead of `.worktrees/PROJ-42/`
- **Fix:** Always run the "Resolve branch name" step before `wtf create`. Detect from context first; ask the user if nothing found. Do NOT skip this even if the feature name seems self-descriptive.

## Example Workflows

**Path A — Worktree (with `wtf`, Jira key provided):**

```
I'm using the isolating-feature-work skill to set up an isolated workspace.

[No CLAUDE.md / AGENTS.md preference found → Ask user → User chose: worktree]
[Check wtf: ~/.local/bin/wtf exists ✓]
[No Jira key in user message or current branch → Ask user → User provides: AUTH-123]
[Run: wtf create AUTH-123-auth]
  → Worktree created at .worktrees/AUTH-123
  → .worktrees/ added to .git/info/exclude
  → Config files copied (.env, .env.local)
  → npm install completed
[Run npm test - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/AUTH-123
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

**Path A — Worktree (with `wtf`, no Jira key):**

```
I'm using the isolating-feature-work skill to set up an isolated workspace.

[No CLAUDE.md / AGENTS.md preference found → Ask user → User chose: worktree]
[Check wtf: ~/.local/bin/wtf exists ✓]
[No Jira key in user message or current branch → Ask user → User skips]
[Run: wtf create add-auth]
  → Worktree created at .worktrees/add-auth
  → .worktrees/ added to .git/info/exclude
  → Config files copied (.env, .env.local)
  → npm install completed
[Run npm test - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/add-auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

**Path A — Worktree (fallback, no `wtf`):**

```
I'm using the isolating-feature-work skill to set up an isolated workspace.

[wtf not found — using fallback]
[Check .worktrees/ - exists]
[Verify ignored - git check-ignore confirms .worktrees/ is ignored]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

**Path B — Feature branch:**

```
I'm using the isolating-feature-work skill to set up an isolated workspace.

[No CLAUDE.md preference found → Ask user → User chose: feature branch]
[git checkout -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Branch feature/auth created and checked out.
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## Red Flags

**Never:**

- Create worktree without verifying it's ignored (project-local) — unless using `wtf` (handles automatically)
- Skip baseline test verification
- Proceed with failing tests without asking
- Assume directory location when ambiguous
- Skip CLAUDE.md / AGENTS.md check
- Call `wtf create` without first resolving the branch name (Jira key detection or user prompt) — Path A

**Always:**

- Ask user (or check CLAUDE.md / AGENTS.md) before choosing worktree vs feature branch
- Follow directory priority: existing > CLAUDE.md / AGENTS.md > default `.worktrees/` (Path A)
- Resolve branch name (detect Jira key from context, or ask user) before calling `wtf create` — Path A
- Use `wtf create` when available (Path A primary); verify ignore manually only in fallback
- Auto-detect and run project setup (fallback only — `wtf` handles this)
- Verify clean test baseline

## Integration

**Called by:**

- **brainstorming** (Phase 4) - REQUIRED when design is approved and implementation follows
- **subagent-driven-development** - REQUIRED before executing any tasks
- **executing-plans** - REQUIRED before executing any tasks
- Any skill needing isolated workspace

**Pairs with:**

- **finishing-a-development-branch** - REQUIRED for cleanup after work complete
