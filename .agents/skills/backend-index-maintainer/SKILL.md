---
name: backend-index-maintainer
description: "Create, update, review, and maintain backend index maps for this repository. Use when working with root or local BACKEND_INDEX.md files, mapping src/modules/**/server, migrating legacy server/README.md backend indexes, updating indexes after backend actions/use-cases/services/repos move or change, or identifying server-side dependencies between modules."
---

# Backend Index Maintainer

Maintain `BACKEND_INDEX.md` as a **map of the existing backend**: short, objective, navigable, and based on real code. It is not narrative documentation, an architecture tutorial, a PRD, a technical plan, or a decision history.

Full templates and examples: `references/backend-index-reference.md`.

---

## Source of Truth

Code is always the source of truth. If the index diverges from the code, trust the code and update the index. Never invent modules, flows, actions, use-cases, services, repos, or dependencies that do not exist in the code.

## What Not to Repeat

Do not repeat global rules in `BACKEND_INDEX.md` that already belong in `AGENTS.md`.

Avoid repeating, for example:

* general architecture explanations;
* global coupling rules;
* project commands;
* global naming patterns;
* generic responsibilities for each layer;
* general Next.js, Supabase, UI, or shared/lib rules.

The index may mention only what is necessary to understand that specific map.

## What Not to Document

Do not use `BACKEND_INDEX.md` to document:

* PRD;
* a feature technical plan;
* execution checklist;
* Ralph loop history;
* task progress;
* future decisions;
* ideas that are not implemented yet;
* UI components;
* line-by-line implementation details.

The index must describe the backend that exists now.

---

## Files

| Type | Path | Responsibility |
|---|---|---|
| Root | `BACKEND_INDEX.md` | Lists modules/submodules with backend code, points to local indexes, maps general dependencies, and flags missing, legacy, or possibly outdated local indexes |
| Local | `src/modules/<module>[/<submodule>]/server/BACKEND_INDEX.md` | Maps only that `server`: entrypoints, actions, use-cases, steps, local services, local repos, external dependencies, main flows, important behaviors, and points of attention |

`src/modules/**/server/README.md` = legacy index. When standardizing the project, migrate useful content into `BACKEND_INDEX.md` instead of keeping both files with the same purpose for long.

---

## When to Use

Use this skill when the task involves:

* creating a root backend index;
* creating a local backend index;
* updating an index after backend changes;
* reviewing whether an index matches the code;
* mapping a module before changing backend code;
* adding, removing, moving, or renaming files inside `src/modules/**/server`;
* identifying server-side dependencies between modules.

---

## Workflow

### 1. Discover Scope

Identify whether the task is about:

* root index;
* local index;
* both.

For a root index, scan:

```txt
src/modules/**/server
```

For a local index, scan only the target module/submodule `server` directory.

### 2. Read Required References

Before editing, read:

```txt
AGENTS.md
```

Then, if it exists, read:

```txt
BACKEND_INDEX.md
```

For local indexes, also read:

```txt
src/modules/**/server/BACKEND_INDEX.md
```

or the legacy file:

```txt
src/modules/**/server/README.md
```

### 3. Map Real Files

Search for files such as:

```txt
slices/**/actions/**/*.action.ts
slices/**/use-cases/**/*.use-case.ts
slices/**/steps/**/*.step.ts
services/**/*.service.ts
repos/**/*.repo.ts
repos/**/*.admin.repo.ts
```

Also observe relevant auxiliary files, such as:

```txt
schemas
validations
types
constants
helpers
mappers
```

Include auxiliary files only when they are important to understand the backend flow.

### 4. Map Relationships Through Imports

Read imports to discover:

* which action calls which use-case or service;
* which use-case calls which steps/services;
* which step calls which services;
* which service calls which repos;
* which external modules are consumed;
* which shared helpers are used;
* which files appear to have no direct reference.

Consider relative imports and alias imports:

```ts
import ... from "./..."
import ... from "../..."
import ... from "@/modules/..."
import ... from "@/shared/..."
import ... from "@/lib/..."
```

### 5. Write or Update the Index

Use the templates in:

```txt
references/backend-index-reference.md
```

Keep the format consistent between root and local indexes.

The main difference is scope:

* root index maps modules;
* local index maps files and flows inside one module.

Use tables when there are multiple items. Use short lists when a table does not add clarity.

---

## Content Pattern

Every index should prioritize:

1. overview;
2. navigable map;
3. dependencies;
4. flows;
5. important behaviors;
6. points of attention;
7. maintenance notes.

## Root Index Rules

The root index should answer:

* which modules have backend code;
* where each module's local index is;
* which modules still do not have a local index;
* which indexes are still in legacy format;
* which important dependencies exist between modules.

Do not detail every internal file of each module in the root index. That detail belongs in the local index.

## Local Index Rules

The local index should answer:

* what role that `server` directory has;
* which entrypoints exist;
* which slices exist;
* which actions, use-cases, steps, services, and repos exist;
* which external dependencies are consumed;
* what the main flows are;
* which important behaviors must be preserved;
* which files or situations require attention.

Do not explain the global project architecture in the local index.

---

## Important Behaviors

Record behaviors that an agent could break without noticing.

Examples:

* rollback;
* best-effort operation;
* fallback;
* side effect;
* email sending;
* record creation across multiple tables;
* admin client usage;
* current host/domain dependency;
* session dependency;
* flow that accepts an existing user;
* flow that must not leak sensitive information;
* flow that must not be blocked by a secondary failure.

## Attention Section

Use the attention section to record:

* files without direct imports;
* legacy files;
* possible duplications;
* outdated indexes;
* flows that need care;
* fragile dependencies;
* points that require manual validation.

Do not remove files just because they appear unused.

Record the suspicion and make clear that it needs validation.

---

## Mandatory Updates

Update `BACKEND_INDEX.md` when:

* creating an action;
* removing an action;
* moving an action;
* creating a use-case;
* removing a use-case;
* moving a use-case;
* creating a step;
* removing a step;
* moving a step;
* creating a service;
* removing a service;
* moving a service;
* creating a repo;
* removing a repo;
* moving a repo;
* changing a main flow;
* changing rollback, fallback, or best-effort behavior;
* changing a dependency between modules;
* adding a new `server` directory;
* removing a `server` directory.

---

## Checklist Before Finishing

Before finishing the task, confirm:

* the index reflects the real code;
* the index does not repeat `AGENTS.md` unnecessarily;
* the index did not become a PRD or technical plan;
* paths are correct;
* entrypoints are listed;
* relevant external dependencies are listed;
* main flows are clear;
* critical behaviors are recorded;
* points of attention are noted without automatic removal;
* the root index was updated when a local index was created, removed, or migrated.

---

## Expected Output

When completing a task with this skill, respond with:

* which indexes were created or updated;
* which modules were mapped;
* which points of attention were found;
* whether any legacy index was identified;
* whether the root index needed to be updated.

Do not include long explanations if the task was only to update an index.
