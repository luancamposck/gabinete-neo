---
name: backend-context-scan
description: "Run a backend-focused Context Scan before a Product PRD, Technical Plan, or implementation. Use whenever the request involves auth, signup, login, user, organization, membership, permissions, roles, Supabase, database, server action, service, repo, use-case, API, email, webhook, storage, payments, external integration, or any server-side behavior. Does not implement code or write a PRD/technical plan."
---

# Backend Context Scan

Quickly map the repository's server-side context before planning or implementing a feature: involved modules, existing files, similar patterns, dependencies, critical behaviors, and risks.

**Do not implement code. Do not write a PRD or Technical Plan.**

---

## Scope

Focus on:

```txt
src/modules/**/server
```

Also read, when necessary to understand the backend:

```txt
src/shared/types, src/shared/infra, src/shared/http
src/shared/constants, src/shared/validations, src/lib
```

Do not scan UI/client code, except when the backend directly depends on schemas/types shared with the UI.

---

## When to Use

Use after a Feature Intake and before: Product PRD, Technical Plan, Ralph Breakdown, implementation, server-side refactor, or creation/change of actions, use-cases, services, repos, or migrations.

## Expected Input

If a `tasks/[YYMMDD]-[feature-name]/` folder with `01-brief.md` already exists (created by the `feature-intake` skill), reuse that folder and read the brief as the main input.

If it does not exist, use the short feature description provided directly. If incomplete, do the best possible scan with what is available. Only block execution if it is impossible to identify any related backend area.

---

## Process

### 1. Understand the Request

Extract from Feature Intake: feature, intent, entities, expected behavior, possibly affected modules, and search keywords. Do not create new requirements.

### 2. Read Global Context

Read `AGENTS.md` (architecture, conventions, restrictions) and the root `BACKEND_INDEX.md` (backend modules, local indexes, already mapped dependencies). Use them as references; do not copy them into the report.

### 3. Classify Candidate Modules

List related modules and classify them:

- `primary` - likely owner/changed module
- `secondary` - may be consumed/adjusted
- `reference` - similar pattern, useful as an example
- `unlikely` - appeared in search, but is unlikely to be relevant

### 4. Read Local Indexes and Real Files

For `primary`/`secondary`/`reference` modules, read `src/modules/**/server/BACKEND_INDEX.md` (or `README.md` as a legacy index). Extract entrypoints, actions, use-cases, services, repos, call matrix, flows, and points of attention.

Then confirm by reading the real files cited. Prioritize actions, use-cases, services, repos, server-side schemas/validations, and input/output types. Do not read the entire project if the indexes already point to what is needed.

### 5. Search for Similar Patterns

Search terms like `sign-up`, `sign-in`, `membership`, `invite`, `role`, `create-user`, and technical patterns like `OperationResponse`, `safeParse`, `rollback`, `best-effort`, `admin.repo`. List what is relevant and why.

### 6. Map Server-Side Dependencies

Record only dependencies relevant to the technical plan. Ignore small/irrelevant imports.

### 7. Identify Critical Behaviors

Examples: rollback, best-effort, fallback, duplicate prevention, admin client usage, session/role/membership checks, domain validation, non-blocking email, neutral error messages that do not leak sensitive information, `auth.users` vs public tables consistency, and data normalization.

### 8. Record Risks and Gaps

Examples: uncertain owner module, missing/outdated index, cross-module dependency, possible migration, risk of duplicating an existing rule, risk of breaking rollback/fallback, risk of changing a contract used by the client. **Only record them; do not solve them here.**

---

## Expected Output

**Always save the report to a file. Never leave it only in terminal/chat.**

- **Location:** `tasks/[YYMMDD]-[feature-name]/02-context-scan.md`
- **Reuse the existing folder** created by `feature-intake` (same date and same `feature-name` from `01-brief.md`). Do not invent or infer a new slug.
- If there is no existing folder/brief (standalone use of this skill), create the folder with the same pattern: `YYMMDD` = current date, `feature-name` in short, clear kebab-case.
- If `02-context-scan.md` already exists, overwrite it with the updated version.

```md
# Backend Context Scan

## 1. Request Summary

## 2. Candidate Modules
| Module/Submodule | Classification | Reason |
|---|---|---|

## 3. Indexes Consulted
| Index | Status | Notes |
|---|---|---|

## 4. Relevant Files
| File | Reason |
|---|---|

## 5. Existing Patterns Found
- ...

## 6. Relevant Server-Side Dependencies
```
module-a -> module-b (reason)
```

## 7. Critical Behaviors to Preserve
- ...

## 8. Risks and Points of Attention
| Risk | Impact | Notes |
|---|---|---|

## 9. Gaps / Questions for the Next Step
- (only if necessary; do not ask what is already clear)

## 10. Recommended Next Step
Product PRD | update BACKEND_INDEX.md | create missing local index | investigate specific file | confirm product decision | Technical Plan
```

---

## Divergence Between Index and Code

If a `BACKEND_INDEX.md` diverges from the real code, the code is the source of truth. Record the divergence in section 8 (Risks). Only update the index automatically if the task explicitly asks for it.

---

## Writing Rules

Be objective, without generic phrases. Do not copy large code excerpts. Do not turn the scan into a tutorial. Do not write a PRD or Technical Plan inside the scan. Do not add requirements that did not come from the Feature Intake or the code.

---

## Checklist Before Finishing

- [ ] `AGENTS.md` and the root `BACKEND_INDEX.md` considered
- [ ] Relevant local indexes considered
- [ ] Real files verified
- [ ] Modules classified
- [ ] Similar patterns identified
- [ ] Dependencies mapped
- [ ] Critical behaviors recorded
- [ ] Risks separated from implementation
- [ ] No code changes made
- [ ] The report did not become a PRD/Technical Plan
- [ ] Report saved to `tasks/[YYMMDD]-[feature-name]/02-context-scan.md`
