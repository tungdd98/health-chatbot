---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
NO PLAN WITHOUT USER APPROVAL
NO EXECUTION WITHOUT USER APPROVAL
```

## The Flow

```
Phase 1-3: Investigate
     ↓
Phase 4: Report to user → Write bug report file → WAIT for approval
     ↓ (approved)
Phase 5: Invoke writing-plans → full plan → User review plan ok
     ↓ (approved)
Phase 6: isolating-feature-work → subagent-driven-development / executing-plans
```

**You have TWO mandatory stops before writing any code.** Skip either one and you are violating this process.

## When to Use

Use for ANY technical issue:

- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use this ESPECIALLY when:**

- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Don't skip when:**

- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Manager wants it fixed NOW (systematic is faster than thrashing)

## The Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - They often contain the exact solution
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - Does it happen every time?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, config changes
   - Environmental differences

4. **Gather Evidence in Multi-Component Systems**

   **WHEN system has multiple components (CI → build → signing, API → service → database):**

   **BEFORE proposing fixes, add diagnostic instrumentation:**

   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   **Example (multi-layer system):**

   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```

   **This reveals:** Which layer fails (secrets → workflow ✓, workflow → build ✗)

5. **Trace Data Flow**

   **WHEN error is deep in call stack:**

   See `root-cause-tracing.md` in this directory for the complete backward tracing technique.

   **Quick version:**
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - What works that's similar to what's broken?

2. **Compare Against References**
   - If implementing pattern, read reference implementation COMPLETELY
   - Don't skim - read every line
   - Understand the pattern fully before applying

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small
   - Don't assume "that can't matter"

4. **Understand Dependencies**
   - What other components does this need?
   - What settings, config, environment?
   - What assumptions does it make?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test hypothesis
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

4. **When You Don't Know**
   - Say "I don't understand X"
   - Don't pretend to know
   - Ask for help
   - Research more

### Phase 4: Bug Report Gate — WAIT FOR USER APPROVAL

**YOU CANNOT PROCEED UNTIL THE USER APPROVES THIS REPORT.**

Present a structured bug report and stop. Do not create a plan. Do not touch code.

**Bug report format:**

```
## Bug Report

**Symptom:** [what the user observed / what error occurred]
**Root cause:** [the specific reason it breaks, with file:line reference]
**Evidence:** [what you found — error messages, stack traces, code you read]
**Affected:** [file paths and line numbers involved]
**Confidence:** High / Medium / Low — [why]
```

After presenting the report, use `AskUserQuestion` to pause:

> "Does this root cause analysis look correct? Approve to proceed to fix planning, or let me know if you see it differently."

**If user rejects or redirects** → return to Phase 1 with new information.  
**If user approves** → proceed to Phase 5.

**This stop is not optional:**

- Root cause is obvious to you → still report and wait
- Bug is simple → still report and wait
- You're under time pressure → ESPECIALLY report and wait

### Phase 5: Fix Plan

**YOU CANNOT WRITE CODE UNTIL THE USER APPROVES THIS PLAN.**

After the user approves the bug report, call `TaskCreate` to create the fix plan, then present it and stop.

**TaskCreate format:**

```
title: Fix [specific bug]
description: |
  Root cause: [one sentence from approved bug report]
  Fix: [single file, single change — be specific]
  Test: [how you will verify it works]
  Out of scope: [things you will NOT touch — name them explicitly]
```

**"Out of scope" is mandatory.** It prevents bundling. If you cannot name what you are NOT fixing, you do not understand the scope.

After creating the task, present the plan and use `AskUserQuestion` to pause:

> "Fix plan created. Does this look good? Approve to start implementation."

**If user requests changes** → update the task and wait again.  
**If user approves** → proceed to Phase 6.

### Phase 6: Implementation

**Fix the root cause, not the symptom. Only start after Phase 5 is approved.**

1. **Create Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework
   - MUST have before fixing
   - Use the `test-driven-development` skill for writing proper failing tests

2. **Implement Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If Fix Doesn't Work**
   - STOP
   - Count: How many fixes have you tried?
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If ≥ 3: STOP and question the architecture (step 5 below)**
   - DON'T attempt Fix #4 without architectural discussion

5. **If 3+ Fixes Failed: Question Architecture**

   **Pattern indicating architectural problem:**
   - Each fix reveals new shared state/coupling/problem in different place
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals:**
   - Is this pattern fundamentally sound?
   - Are we "sticking with it through sheer inertia"?
   - Should we refactor architecture vs. continue fixing symptoms?

   **Discuss with your human partner before attempting more fixes**

   This is NOT a failed hypothesis - this is a wrong architecture.

## Red Flags - STOP and Follow Process

If you catch yourself thinking:

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**
- **"Root cause is clear, I'll just fix it now"** — skipping Phase 4 report
- Saying "Now creating the task plan" **without calling TaskCreate tool**
- **"Applying both now"** / "also updating X" — bundling multiple changes
- Moving to Phase 5 **without user approval of the bug report**
- Moving to Phase 4 **without user approval of the fix plan**

**ALL of these mean: STOP. Return to Phase 1.**

**If 3+ fixes failed:** Question the architecture (see Phase 6, step 5)

## your human partner's Signals You're Doing It Wrong

**Watch for these redirections:**

- "Is that not happening?" - You assumed without verifying
- "Will it show us...?" - You should have added evidence gathering
- "Stop guessing" - You're proposing fixes without understanding
- "Ultrathink this" - Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) - Your approach isn't working

**When you see these:** STOP. Return to Phase 1.

## Common Rationalizations

| Excuse                                       | Reality                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| "Issue is simple, don't need process"        | Simple issues have root causes too. Process is fast for simple bugs.    |
| "Emergency, no time for process"             | Systematic debugging is FASTER than guess-and-check thrashing.          |
| "Just try this first, then investigate"      | First fix sets the pattern. Do it right from the start.                 |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it.                       |
| "Multiple fixes at once saves time"          | Can't isolate what worked. Causes new bugs.                             |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely.              |
| "I see the problem, let me fix it"           | Seeing symptoms ≠ understanding root cause.                             |
| "One more fix attempt" (after 2+ failures)   | 3+ failures = architectural problem. Question pattern, don't fix again. |
| "Root cause is obvious, I'll skip report"    | Obvious to you ≠ obvious to user. Report first, always.                 |
| "User will approve the report anyway"        | User approval is not a formality — it's a checkpoint. Wait for it.      |
| "TaskPlan is overhead for a small fix"       | Phase 5 takes 30 seconds. Fixing the wrong thing wastes 30 minutes.     |

## Quick Reference

| Phase             | Key Activities                                         | Gate to next phase       |
| ----------------- | ------------------------------------------------------ | ------------------------ |
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY  |
| **2. Pattern**    | Find working examples, compare                         | Identify differences     |
| **3. Hypothesis** | Form theory, test minimally                            | Confirmed hypothesis     |
| **3.5. Report**   | Present bug report → AskUserQuestion → WAIT            | **User approves report** |
| **3.7. Plan**     | TaskCreate fix plan → Present → AskUserQuestion → WAIT | **User approves plan**   |
| **4. Execute**    | Create failing test, implement single fix, verify      | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals issue is truly environmental, timing-dependent, or external:

1. You've completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

**But:** 95% of "no root cause" cases are incomplete investigation.

## Supporting Techniques

These techniques are part of systematic debugging and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through call stack to find original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling

**Related skills:**

- **test-driven-development** - For creating failing test case (Phase 4, Step 1)
- **verification-before-completion** - Verify fix worked before claiming success

## Real-World Impact

From debugging sessions:

- Systematic approach: 15-30 minutes to fix
- Random fixes approach: 2-3 hours of thrashing
- First-time fix rate: 95% vs 40%
- New bugs introduced: Near zero vs common
