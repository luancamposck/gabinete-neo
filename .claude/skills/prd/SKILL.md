---
name: prd
description: "Generate a Product Requirements Document (PRD) for a new feature. Use when planning a feature, starting a new project, or when asked to create a PRD. Triggers on: create a prd, write prd for, plan this feature, requirements for, spec out."
user-invocable: true
---

# PRD Generator

Create detailed Product Requirements Documents that are clear, actionable, and suitable for implementation.

---

## The Job

1. Receive a feature description from the user, or read the existing feature folder context
2. Summarize inferred decisions/trade-offs from existing context before asking questions
3. Ask up to 3-5 essential clarifying questions only when needed (with lettered options)
4. Generate a structured PRD based on available context and user answers
5. Save to `tasks/[YYMMDD]-[feature-name]/03-prd.md`

**Important:** Do NOT start implementing. Do NOT write a Technical Plan. Just create or update the PRD.

---

## Folder & Output File

If a feature folder already exists at `tasks/[YYMMDD]-[feature-name]/` (created by `feature-intake` and/or `backend-context-scan`), **reuse that folder** — same date, same `feature-name`. Do not invent or infer a new slug. Read `01-brief.md` and `02-context-scan.md` from it, if present, as input context before asking clarifying questions (skip questions already answered there).

If no folder exists yet (standalone use of this skill), create one following the same pattern: `YYMMDD` = current date, `feature-name` in kebab-case, short and clear.

Save to:

```txt
tasks/[YYMMDD]-[feature-name]/03-prd.md
```

If `03-prd.md` already exists, update it instead of creating a duplicate.

---

## Step 1: Assumptions & Clarifying Questions

Before asking clarifying questions, summarize decisions and trade-offs already inferred from:

- the current prompt
- `01-brief.md`
- `02-context-scan.md`

Present inferred decisions as assumptions to be confirmed, not as new questions.

Example:

```markdown
## Inferred Decisions

Based on the existing context, I will assume:

- The feature is backend-first, but may include UI if the requirement asks for it.
- Existing module patterns should be reused instead of creating a new architecture.
- The current rollback/best-effort behavior should be preserved where applicable.
- Existing decisions from `01-brief.md` and `02-context-scan.md` should not be re-opened unless they conflict.

Please correct any assumption that is wrong.
```

Ask only critical questions where the initial prompt, `01-brief.md`, and `02-context-scan.md` are ambiguous. Skip anything already covered by existing context. Do not ask the user to reconfirm decisions already stated in the feature folder or current prompt.

If the context is sufficient to write a useful PRD, do not ask questions just to satisfy a fixed number.

Focus on:

- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

### Format Questions Like This:

```markdown
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the scope?
   A. Minimal viable version
   B. Full-featured implementation
   C. Just the backend/API
   D. Just the UI
```

This lets users respond with "1A, 2C, 3B" for quick iteration. Remember to indent the options.

---

## Step 2: PRD Structure

Generate the PRD with these sections:

### 1. Introduction/Overview
Brief description of the feature and the problem it solves.

### 2. Goals
Specific, measurable objectives (bullet list).

### 3. User Stories
Each story needs:
- **Title:** Short descriptive name
- **Description:** "As a [user], I want [feature] so that [benefit]"
- **Acceptance Criteria:** Verifiable checklist of what "done" means

Each story should be small enough to implement in one focused session.

**Format:**
```markdown
### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] Typecheck/lint passes
- [ ] **[UI stories only]** Verify in browser using dev-browser skill
```

**Important:**
- Acceptance criteria must be verifiable, not vague. "Works correctly" is bad. "Button shows confirmation dialog before deleting" is good.
- **For any story with UI changes:** Always include "Verify in browser using dev-browser skill" as acceptance criteria. This ensures visual verification of frontend work.

### 4. Functional Requirements
Numbered list of specific functionalities:
- "FR-1: The system must allow users to..."
- "FR-2: When a user clicks X, the system must..."

Be explicit and unambiguous.

### 5. Non-Goals (Out of Scope)
What this feature will NOT include. Critical for managing scope.

### 6. Design Considerations (Optional)
- UI/UX requirements
- Link to mockups if available
- Relevant existing components to reuse

### 7. Technical Considerations (Optional)
- Known constraints or dependencies
- Integration points with existing systems
- Performance, security, auth, permissions, or data consistency considerations
- Relevant findings from `02-context-scan.md`, if present (modules involved, existing patterns, critical behaviors, risks)

Do not define file-by-file implementation here. That belongs to Technical Plan.

### 8. Success Metrics
How will success be measured?
- "Reduce time to complete X by 50%"
- "Increase conversion rate by 10%"

### 9. Open Questions
Remaining questions or areas needing clarification.

---

## Writing for Junior Developers

The PRD reader may be a junior developer or AI agent. Therefore:

- Be explicit and unambiguous
- Avoid jargon or explain it
- Provide enough detail to understand purpose and core logic
- Number requirements for easy reference
- Use concrete examples where helpful

---

## Example PRD

```markdown
# PRD: Task Priority System

## Introduction

Add priority levels to tasks so users can focus on what matters most. Tasks can be marked as high, medium, or low priority, with visual indicators and filtering to help users manage their workload effectively.

## Goals

- Allow assigning priority (high/medium/low) to any task
- Provide clear visual differentiation between priority levels
- Enable filtering and sorting by priority
- Default new tasks to medium priority

## User Stories

### US-001: Add priority field to database
**Description:** As a developer, I need to store task priority so it persists across sessions.

**Acceptance Criteria:**
- [ ] Add priority column to tasks table: 'high' | 'medium' | 'low' (default 'medium')
- [ ] Generate and run migration successfully
- [ ] Typecheck passes

### US-002: Display priority indicator on task cards
**Description:** As a user, I want to see task priority at a glance so I know what needs attention first.

**Acceptance Criteria:**
- [ ] Each task card shows colored priority badge (red=high, yellow=medium, gray=low)
- [ ] Priority visible without hovering or clicking
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Add priority selector to task edit
**Description:** As a user, I want to change a task's priority when editing it.

**Acceptance Criteria:**
- [ ] Priority dropdown in task edit modal
- [ ] Shows current priority as selected
- [ ] Saves immediately on selection change
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Filter tasks by priority
**Description:** As a user, I want to filter the task list to see only high-priority items when I'm focused.

**Acceptance Criteria:**
- [ ] Filter dropdown with options: All | High | Medium | Low
- [ ] Filter persists in URL params
- [ ] Empty state message when no tasks match filter
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Add `priority` field to tasks table ('high' | 'medium' | 'low', default 'medium')
- FR-2: Display colored priority badge on each task card
- FR-3: Include priority selector in task edit modal
- FR-4: Add priority filter dropdown to task list header
- FR-5: Sort by priority within each status column (high to medium to low)

## Non-Goals

- No priority-based notifications or reminders
- No automatic priority assignment based on due date
- No priority inheritance for subtasks

## Technical Considerations

- Reuse existing badge component with color variants
- Filter state managed via URL search params
- Priority stored in database, not computed

## Success Metrics

- Users can change priority in under 2 clicks
- High-priority tasks immediately visible at top of lists
- No regression in task list performance

## Open Questions

- Should priority affect task ordering within a column?
- Should we add keyboard shortcuts for priority changes?
```

---

## Checklist

Before saving the PRD:

- [ ] Reused existing feature folder (if any), instead of inferring a new slug
- [ ] Read `01-brief.md` / `02-context-scan.md`, if present, before asking questions
- [ ] Explicitly summarized inferred decisions/trade-offs from existing context
- [ ] Asked clarifying questions with lettered options, or skipped because existing context was sufficient
- [ ] Did not ask again about decisions already answered in `01-brief.md` or `02-context-scan.md`
- [ ] Incorporated user's answers
- [ ] User stories are small and specific
- [ ] Functional requirements are numbered and unambiguous
- [ ] Non-goals section defines clear boundaries
- [ ] Technical considerations do not include file-by-file implementation details
- [ ] Saved to `tasks/[YYMMDD]-[feature-name]/03-prd.md`
