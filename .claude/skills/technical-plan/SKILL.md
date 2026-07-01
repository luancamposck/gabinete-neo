---
name: technical-plan
description: "Creates a technical plan to implement a feature based on 01-brief.md, 02-context-scan.md, and 03-prd.md. Use before Ralph Breakdown or implementation. Defines architecture, modules, files, data, integrations, validation, and technical strategy. Does not implement code and does not break work into Ralph tasks."
user-invocable: true
---

# Technical Plan

Translates the PRD and Context Scan into concrete technical decisions: owning module, files, data, contracts, validation, side effects, and risks.

**Does not implement code. Does not write a Ralph Breakdown. Does not reopen product decisions already defined in the PRD.**

Full templates and examples for each section: `references/technical-plan-reference.md` (kept in Portuguese — same templates, just the reference doc's language).

---

## The Job

1. Reuse (or create) the feature folder at `tasks/[YYMMDD]-[feature-name]/`
2. Read `01-brief.md`, `02-context-scan.md`, and `03-prd.md`, if they exist
3. Record inferred technical assumptions (don't reopen decisions already answered)
4. Define module ownership, architecture, files, data, contracts, validation, side effects, and error strategy
5. Record technical risks and open questions
6. Save to `tasks/[YYMMDD]-[feature-name]/04-technical-plan.md`

---

## Folder & Output File

Reuse the feature folder if it already exists — do not invent a different slug. Read `01-brief.md`, `02-context-scan.md`, and `03-prd.md` when available.

If no folder exists, create one: `YYMMDD` = current date, `feature-name` in kebab-case.

Save to `tasks/[YYMMDD]-[feature-name]/04-technical-plan.md`. If it already exists, update it instead of duplicating.

## Expected Input

Primary: `03-prd.md`. Supporting: `01-brief.md`, `02-context-scan.md`, when available. Preferably use this skill after `03-prd.md` exists.

- No PRD, but enough feature description → generate the best possible plan and record the missing PRD as a risk (fallback, not the normal flow).
- No Context Scan → don't invent context; use the real code and record the gap.

---

## PRD vs. Technical Plan vs. Ralph Breakdown

| Document | Answers |
|---|---|
| PRD | What needs to be delivered? |
| Technical Plan | How will this be implemented in this project? |
| Ralph Breakdown | How does this plan break down into small, executable tasks? |

Don't turn the Technical Plan into a Ralph task list, and don't rewrite the PRD.

---

## Process

### 1. Read feature context
Extract from `01-brief.md`/`02-context-scan.md`/`03-prd.md`: goal, scope, non-goals, user stories, functional requirements, critical behaviors, risks, candidate modules, relevant files, existing patterns. Don't reopen decisions already defined, unless there's a clear technical conflict.

### 2. Record technical assumptions
Summarize the technical decisions inferred from the PRD/Context Scan before detailing the plan (format in `references/technical-plan-reference.md`). Don't pause for confirmation unless there's a technical uncertainty that blocks the plan — in that case, record it under "Open Technical Questions." Don't ask about anything already answered in the PRD/Context Scan.

### 3. Module ownership
Classify each involved module: `owner` (main implementation), `dependency` (consumed), `reference` (example pattern), `unchanged` (relevant, no planned change).

### 4. Technical strategy
Describe at a high level: main flow, per-module responsibilities, reuse of existing code, new abstractions needed, input/output contracts, error handling, rollback/fallback/best-effort, validation, data consistency. No line-by-line detail.

### 5. File plan
List likely files with status `create` / `update` / `read-only` / `maybe` / `remove` and the reason. No code.

### 6. Data & database
If the feature touches the database: tables, new columns, constraints, indexes, RLS, triggers, RPCs, migrations, Supabase types. If it doesn't touch the database, state that explicitly.

### 7. Contracts
Input, expected output (e.g., `OperationResponse<...>`), relevant error codes, client impact — without defining final types.

### 8. Validation & security
Server-side validation, authentication, authorization/roles/ownership, multi-tenancy, prevention of sensitive-data leaks, use of admin client.

### 9. Integrations & side effects
Email, webhook, storage, payment, analytics, queues, external APIs — indicating whether each one blocks the flow or is best-effort.

### 10. Error strategy
Expected vs. unexpected errors, friendly messages, rollback, fallback, best-effort.

### 11. Documentation impact
Which `BACKEND_INDEX.md` files (local and/or root) need to be updated after implementation.

---

## Expected Output

Save to `04-technical-plan.md` with this structure (section templates in `references/technical-plan-reference.md`):

```md
# Technical Plan: [Feature Name]

## 1. Overview
## 2. Inputs Reviewed
## 3. Technical Assumptions
## 4. Module Ownership
## 5. Proposed Architecture
## 6. File Plan
## 7. Data / Database Plan
## 8. Contracts
## 9. Validation & Security
## 10. Side Effects & Integrations
## 11. Error Strategy
## 12. Documentation Updates
## 13. Risks & Trade-offs
## 14. Open Technical Questions
## 15. Next Step (Ralph Breakdown, if there are no blocking Open Technical Questions)
```

---

## Writing Rules

Specific and practical. No implementation, no complete code, no Ralph tasks, no rewriting the PRD, no reopening product decisions already defined. Don't invent a module, table, or file without basis in the Context Scan or existing code. Assumption → record as an assumption. Risk → record as a risk. Technical doubt → record under Open Technical Questions.

---

## Checklist Before Finishing

- [ ] Reused the existing feature folder, if any
- [ ] Read `01-brief.md`, `02-context-scan.md`, and `03-prd.md`, if they exist
- [ ] Did not reopen decisions already answered in the PRD
- [ ] Defined module ownership
- [ ] Listed files to create/update/consult
- [ ] Recorded database impact (or confirmed there is none)
- [ ] Defined expected contracts
- [ ] Recorded validation, security, side effects, and error strategy
- [ ] Recorded documentation to update
- [ ] Did not write code or a Ralph Breakdown
- [ ] Saved to `tasks/[YYMMDD]-[feature-name]/04-technical-plan.md`
