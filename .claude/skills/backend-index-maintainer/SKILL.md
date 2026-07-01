---
name: backend-index-maintainer
description: "Create and maintain root and local BACKEND_INDEX.md files as short, navigable maps of the repository backend layer. Use whenever creating/removing/moving actions, use-cases, steps, services, or repos in src/modules/**/server, adding a new server directory, or when an existing index appears outdated. Does not write PRDs, technical plans, execution history, or UI documentation."
user-invocable: true
---

# Backend Index Maintainer

Maintain `BACKEND_INDEX.md` as a **map of the existing backend**: short, objective, navigable, and based on real code. It is not narrative documentation, an architecture tutorial, a PRD, a technical plan, or a decision history.

Full templates and examples: `references/backend-index-reference.md`.

---

## Source of Truth

Code is always the source of truth. If the index diverges from the code, trust the code and update the index. Never invent modules, actions, use-cases, services, repos, or dependencies that do not exist.

## What Not to Put in the Index

- Global architecture/coupling/naming rules, project commands -> belongs in `AGENTS.md`
- PRD, technical plan, execution checklist, task progress, future decisions -> belongs in `tasks/`
- UI components or line-by-line implementation details

---

## Files

| Type | Path | Responsibility |
|---|---|---|
| Root | `BACKEND_INDEX.md` | Lists modules/submodules with backend code, points to local indexes, maps general dependencies, flags missing/legacy/outdated indexes |
| Local | `src/modules/<module>[/<submodule>]/server/BACKEND_INDEX.md` | Maps only that `server`: entrypoints, actions, use-cases, steps, local services, local repos, external dependencies, flows, important behaviors, points of attention |

`src/modules/**/server/README.md` = legacy index. When standardizing the project, migrate useful content into `BACKEND_INDEX.md` instead of keeping both for the same purpose.

---

## Process

### 1. Define Scope

Root index, local index, or both? Root -> scan `src/modules/**/server`. Local -> scan only the target module/submodule `server`.

### 2. Read References

`AGENTS.md` -> existing index (root and/or local, or legacy `README.md`, if present).

### 3. Map Real Files

```txt
slices/**/actions/**/*.action.ts
slices/**/use-cases/**/*.use-case.ts
slices/**/steps/**/*.step.ts
services/**/*.service.ts
repos/**/*.repo.ts | *.admin.repo.ts
```

Include schemas/validations/types/constants/helpers/mappers only when they are important to understand the flow.

### 4. Map Relationships Through Imports

Discover who calls whom (action -> use-case/service -> step/service -> repo), which external modules and shared helpers are used, and which files appear to have no direct references. Consider relative and alias imports (`./`, `../`, `@/modules/...`, `@/shared/...`, `@/lib/...`).

### 5. Write/Update

Use the templates in `references/backend-index-reference.md`. The root index maps modules; the local index maps internal files and flows. Use tables for multiple items, short lists when a table does not help.

Record as an **important behavior** anything an agent could accidentally break: rollback, best-effort, fallback, side effects, email, writes to multiple tables, admin client, host/session dependency, flow that accepts an existing user, flow that must not leak sensitive information.

In the attention section, record suspicions (file without direct imports, possible duplication, outdated index) without automatically removing anything. Only flag them.

---

## Mandatory Updates

Update the index when creating, removing, or moving any action/use-case/step/service/repo; when changing the main flow, rollback/fallback/best-effort, or dependency between modules; when adding/removing a `server` directory. In the last case, also update the root index.

---

## Checklist Before Finishing

- [ ] Index reflects the real code (not what should exist)
- [ ] Does not repeat `AGENTS.md` content
- [ ] Did not become a PRD/technical plan
- [ ] Paths and entrypoints are correct
- [ ] Relevant external dependencies are listed
- [ ] Main flows are clear
- [ ] Critical behaviors are recorded
- [ ] Points of attention are noted without automatic removal
- [ ] Root index updated if a local index was created/removed/migrated

---

## Expected Output

Respond briefly: which indexes were created/updated, which modules were mapped, points of attention found, whether any legacy index was identified, and whether the root index needed updating. No long explanations if the task was only to update an index.
