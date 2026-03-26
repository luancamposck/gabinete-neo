# PRD: Architecture Compliance — Full AGENTS.md Alignment

## Introduction

This PRD covers the complete effort to align the gabinete-neo codebase with the architecture rules defined in `AGENTS.md`. It includes fixes already applied (Phase 1) and all remaining work (Phases 2-6). The goal is to ensure every file, folder, import, and pattern in the project meets the senior-level standards we've established.

## Goals

- Eliminate all architectural violations found in the codebase audit
- Ensure 100% compliance with `AGENTS.md` rules across all modules
- Standardize folder structure (`shared/ui/` convention) across all 8 modules
- Remove SDK coupling from `src/shared/` (pure helpers only)
- Enforce correct layer boundaries (Action -> Service/Use-case -> Service -> Repo)
- Relocate misplaced directories to their correct locations per convention
- Standardize use-case comment format across all files
- Consolidate global components from `src/components/` into `src/shared/components/`

---

## Phase 1: Critical Architecture Fixes (DONE)

These 6 user stories were already implemented and committed.

### US-001: Fix relative import in tasks module
**Description:** As a developer, I want all imports to use the `@/` absolute alias so the codebase is consistent and refactor-safe.

**Acceptance Criteria:**
- [x] `src/modules/organizations/tasks/ui/data-table/organization-task-actions.tsx` uses `@/modules/organizations/tasks/ui/assign-users-to-task-dialog` instead of `"../assign-users-to-task-dialog"`
- [x] Typecheck passes

**Commit:** `fix(tasks): replace relative import with absolute @/ alias`

---

### US-002: Fix typo in dashboard-guard action filename
**Description:** As a developer, I want filenames to be spelled correctly so imports are predictable and searchable.

**Acceptance Criteria:**
- [x] File renamed from `require-dashboard-acess.action.ts` to `require-dashboard-access.action.ts`
- [x] Import in `src/app/dashboard/layout.tsx` updated
- [x] Typecheck passes

**Commit:** `fix(auth): correct typo in dashboard-guard action filename`

---

### US-003: Move auth UI to shared/ui/
**Description:** As a developer, I want module-specific UI components in `shared/ui/` per the AGENTS.md convention.

**Acceptance Criteria:**
- [x] `src/modules/auth/ui/auth-tabs.tsx` moved to `src/modules/auth/shared/ui/auth-tabs.tsx`
- [x] `src/modules/auth/ui/sign-in-form.tsx` moved to `src/modules/auth/shared/ui/sign-in-form.tsx`
- [x] Internal import (auth-tabs -> sign-in-form) updated
- [x] External import in `src/app/page.tsx` updated
- [x] Old `src/modules/auth/ui/` directory removed
- [x] Typecheck passes

**Commit:** `refactor(auth): move UI components to shared/ui per module convention`

---

### US-004: Replace action calls with service in use-cases
**Description:** As a developer, I want use-cases to call services directly (not actions) to respect the Use-case -> Service(s) rule.

**Acceptance Criteria:**
- [x] All 8 use-case files updated to import `getOrganizationIdByAppDomainService` instead of `getOrganizationIdByAppDomainAction`
- [x] Import paths changed from `.../actions/...` to `@/modules/organizations/server/services/...`
- [x] Call sites updated from `getOrganizationIdByAppDomainAction(` to `getOrganizationIdByAppDomainService(`
- [x] Typecheck passes

**Files changed:**
1. `organizations/server/slices/update-current-organization/use-cases/update-current-organization.use-case.ts`
2. `organizations/server/slices/upload-organization-og-image/use-cases/upload-organization-og-image.use-case.ts`
3. `organizations/tasks/server/slices/get-tasks-for-table/use-cases/get-tasks-for-table.use-case.ts`
4. `organizations/tasks/server/slices/create-task/use-cases/create-task.use-case.ts`
5. `organizations/tasks/server/slices/assign-users-to-task/use-cases/assign-users-to-task.use-case.ts`
6. `organizations/tasks/server/slices/get-assignable-users/use-cases/get-assignable-users.use-case.ts`
7. `organizations/referrals/server/slices/get-organization-referrals-for-table/use-cases/get-organization-referrals-for-table.use-case.ts`
8. `organizations/memberships/server/slices/get-organization-members-for-table/use-cases/get-organization-members-for-table.use-case.ts`

**Commit:** `refactor(organizations): replace action calls with service in use-cases`

---

### US-005: Extract business logic from repo to service layer
**Description:** As a developer, I want repos to be thin data-access layers with zero business logic, per the architecture rules.

**Acceptance Criteria:**
- [x] `getExtFromMime()` function moved from `upload-organization-og-image.admin.repo.ts` to `upload-organization-og-image.service.ts`
- [x] Repo `Params` type updated to accept `ext: string` instead of computing it
- [x] Service resolves `ext` before calling the repo
- [x] Typecheck passes

**Commit:** `refactor(organizations): extract getExtFromMime from repo to service layer`

---

### US-006: Move getPublicAssetUrl from shared to organizations repo+service
**Description:** As a developer, I want `src/shared/` to contain only pure helpers without SDK coupling. The `getPublicAssetUrl` function accesses Supabase directly and belongs in the organizations module.

**Acceptance Criteria:**
- [x] New repo: `src/modules/organizations/server/repos/get-public-asset-url.repo.ts`
- [x] New service: `src/modules/organizations/server/services/get-public-asset-url.service.ts`
- [x] 3 action files updated to import `getPublicAssetUrlService` from the new service
- [x] `src/shared/storage/get-public-asset-url.ts` deleted
- [x] `src/shared/storage/` directory removed
- [x] Typecheck passes

**Commit:** `refactor(organizations): move getPublicAssetUrl from shared to repo+service`

---

## Phase 2: Migrate UI folders to shared/ui/ (7 modules, ~45 files)

All module-specific UI components currently live in `<module>/ui/` but AGENTS.md prescribes `<module>/shared/ui/`. Each story below moves one module's UI.

### US-007: Move accounts/onboarding UI to shared/ui/
**Description:** As a developer, I want the onboarding UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 3 files from `src/modules/accounts/onboarding/ui/` to `src/modules/accounts/onboarding/shared/ui/`
  - `forgot-password-form.tsx`
  - `reset-password-form.tsx`
  - `register-and-join-form.tsx`
- [ ] Update 3 external imports:
  - `src/app/reset-password/page.tsx`
  - `src/app/forgot-password/page.tsx`
  - `src/modules/auth/shared/ui/auth-tabs.tsx`
- [ ] Update any internal cross-references between moved files
- [ ] Remove empty `src/modules/accounts/onboarding/ui/` directory
- [ ] Typecheck passes

---

### US-008: Move accounts/users UI to shared/ui/
**Description:** As a developer, I want the users UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 3 files from `src/modules/accounts/users/ui/` to `src/modules/accounts/users/shared/ui/`
  - `edit-password-form.tsx`
  - `edit-username-form.tsx`
  - `edit-address-form.tsx`
- [ ] Update 3 imports in `src/app/dashboard/my-account/page.tsx`
- [ ] Remove empty `src/modules/accounts/users/ui/` directory
- [ ] Typecheck passes

---

### US-009: Move app-shell UI to shared/ui/
**Description:** As a developer, I want the app-shell UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 2 files from `src/modules/app-shell/ui/` to `src/modules/app-shell/shared/ui/`
  - `nav-footer.tsx`
  - `app-sidebar.tsx`
- [ ] Update 1 external import in `src/app/dashboard/layout.tsx`
- [ ] Update 1 internal import (`app-sidebar.tsx` references `nav-footer.tsx`)
- [ ] Remove empty `src/modules/app-shell/ui/` directory
- [ ] Typecheck passes

---

### US-010: Move organizations base UI to shared/ui/
**Description:** As a developer, I want the organizations base UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 4 files from `src/modules/organizations/ui/` to `src/modules/organizations/shared/ui/`
  - `link-share-preview.tsx`
  - `organization-config.context.tsx`
  - `edit-organization-image-form.tsx`
  - `edit-organization-field-form.tsx`
- [ ] Update 4 imports in `src/app/dashboard/config/organization/page.tsx`
- [ ] Update 3 internal cross-references between moved files
- [ ] Remove empty `src/modules/organizations/ui/` directory
- [ ] Typecheck passes

---

### US-011: Move organizations/memberships UI to shared/ui/
**Description:** As a developer, I want the memberships UI components in `shared/ui/` per module convention. This is the largest migration (~23 files).

**Acceptance Criteria:**
- [ ] Move entire `src/modules/organizations/memberships/ui/` tree to `src/modules/organizations/memberships/shared/ui/`
  - `join-organization-button.tsx`
  - `data-table/` (README.md, table-meta.types.ts, shared/, sheets/, table/, columns/, actions/)
  - `roles/` (roles-cards.tsx, create-role-form.tsx)
  - `users/` (actions/, table/, cards/, users-explorer.tsx)
- [ ] Update 5 external imports in page files:
  - `src/app/dashboard/network/my-network/page.tsx`
  - `src/app/join/page.tsx`
  - `src/app/dashboard/config/roles/page.tsx`
  - `src/app/dashboard/config/users/page.tsx`
  - `src/app/dashboard/config/roles/new/page.tsx`
- [ ] Update ~24 internal cross-references between moved files
- [ ] Remove empty `src/modules/organizations/memberships/ui/` directory
- [ ] Typecheck passes

---

### US-012: Move organizations/referrals UI to shared/ui/
**Description:** As a developer, I want the referrals UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 2 files from `src/modules/organizations/referrals/ui/` to `src/modules/organizations/referrals/shared/ui/`
  - `organization-referrals-table.tsx`
  - `my-referral-link-button.tsx`
- [ ] Update 2 imports in `src/app/dashboard/network/my-invites/page.tsx`
- [ ] Remove empty `src/modules/organizations/referrals/ui/` directory
- [ ] Typecheck passes

---

### US-013: Move organizations/tasks UI to shared/ui/
**Description:** As a developer, I want the tasks UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 6 files from `src/modules/organizations/tasks/ui/` to `src/modules/organizations/tasks/shared/ui/`
  - `create-task-form.tsx`
  - `assign-users-to-task-dialog.tsx`
  - `data-table/organization-tasks-table.tsx`
  - `data-table/organization-tasks-table-toolbar.tsx`
  - `data-table/columns.tsx`
  - `data-table/organization-task-actions.tsx`
- [ ] Update 2 external imports in page files:
  - `src/app/dashboard/task/new/page.tsx`
  - `src/app/dashboard/task/all/page.tsx`
- [ ] Update 1 internal cross-reference in `organization-task-actions.tsx`
- [ ] Remove empty `src/modules/organizations/tasks/ui/` directory
- [ ] Typecheck passes

---

### US-014: Move people-map UI to shared/ui/
**Description:** As a developer, I want the people-map UI components in `shared/ui/` per module convention.

**Acceptance Criteria:**
- [ ] Move 2 files from `src/modules/organizations/insights/people-map/ui/` to `src/modules/organizations/insights/people-map/shared/ui/`
  - `map-client.tsx`
  - `world-people-map-maplibre.tsx`
- [ ] Update 1 import in `src/app/dashboard/network/map/page.tsx`
- [ ] Update 1 internal cross-reference (`map-client.tsx` imports `world-people-map-maplibre.tsx`)
- [ ] Remove empty `src/modules/organizations/insights/people-map/ui/` directory
- [ ] Typecheck passes

---

## Phase 3: Consolidate global components into src/shared/components/ (37 files, ~149 imports)

The project currently has `src/components/` at the root level, but per AGENTS.md all shared code belongs under `src/shared/`. This phase moves everything:
- shadcn UI primitives (`src/components/ui/`) go to `src/shared/components/ui/`
- Composed global components (`src/components/*.tsx`) go to `src/shared/components/`

### US-015: Move shadcn UI primitives to src/shared/components/ui/
**Description:** As a developer, I want all shadcn/ui primitives under `src/shared/components/ui/` so the design system lives within the established shared structure.

**Acceptance Criteria:**
- [ ] Move all 33 files from `src/components/ui/` to `src/shared/components/ui/`
  - accordion, badge, button, calendar, card, checkbox, collapsible, combobox, command, data-table-faceted-filter, data-table-pagination, data-table-skeleton, data-table-view-options, data-table, dialog, dropdown-menu, field, form, input-group, input, label, popover, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, textarea, tooltip
- [ ] Update ~139 import references across the codebase (`@/components/ui/` to `@/shared/components/ui/`)
- [ ] Update internal cross-references between UI components (e.g., `command.tsx` imports `dialog.tsx`, `combobox.tsx` imports `command.tsx`, `field.tsx` imports `label.tsx`, etc.)
- [ ] Typecheck passes

---

### US-016: Move composed global components to src/shared/components/
**Description:** As a developer, I want composed global components (mode toggle, theme provider, vortex, waves) under `src/shared/components/` per convention.

**Acceptance Criteria:**
- [ ] Move 4 files from `src/components/` to `src/shared/components/`
  - `mode-toggle-button.tsx`
  - `theme-provider.tsx`
  - `vortex.tsx`
  - `waves.tsx`
- [ ] Update 10 import references:
  - `mode-toggle-button.tsx`: `src/app/dashboard/layout.tsx`, `src/app/lp/page.tsx`
  - `theme-provider.tsx`: `src/app/layout.tsx`
  - `vortex.tsx`: `src/app/page.tsx`, `src/app/dashboard/layout.tsx`, `src/app/reset-password/page.tsx`, `src/app/forgot-password/page.tsx`
  - `waves.tsx`: `src/app/tenant-not-found/page.tsx`, `src/app/error.tsx`, `src/app/join/page.tsx`
- [ ] Remove empty `src/components/` directory
- [ ] Typecheck passes

---

### US-017: Update shadcn CLI configuration
**Description:** As a developer, I want the shadcn CLI to generate new components in the correct location so future `npx shadcn add` commands respect the new structure.

**Acceptance Criteria:**
- [ ] Update `components.json` (or equivalent shadcn config) to point `aliases.components` to `@/shared/components`
- [ ] Update `aliases.ui` to point to `@/shared/components/ui`
- [ ] Verify `npx shadcn add` generates files in the correct location
- [ ] Update `src/lib/utils/cn.ts` import path if referenced in shadcn config

---

## Phase 4: Relocate misplaced directories (3 directories, 5 files)

### US-018: Move src/providers/ to src/lib/providers/
**Description:** As a developer, I want provider wrappers (third-party client initialization) in `src/lib/` per the convention that `src/lib/` holds only third-party wrappers.

**Acceptance Criteria:**
- [ ] Move `src/providers/query-provider.tsx` to `src/lib/providers/query-provider.tsx`
- [ ] Update 1 import in `src/app/layout.tsx`
- [ ] Remove empty `src/providers/` directory
- [ ] Typecheck passes

---

### US-019: Move src/hooks/ to correct locations
**Description:** As a developer, I want hooks organized per module or in `src/shared/hooks/` for cross-module hooks, following the established conventions.

**Acceptance Criteria:**
- [ ] Move `src/hooks/use-mobile.ts` to `src/shared/hooks/use-mobile.ts` (used by shared `sidebar.tsx`)
- [ ] Move `src/hooks/use-persisted-table-state.ts` to `src/shared/hooks/use-persisted-table-state.ts` (used by tasks and memberships modules)
- [ ] Move `src/hooks/use-referral-link-storage.ts` to `src/shared/hooks/use-referral-link-storage.ts` (used by referrals and accounts modules)
- [ ] Update 4 import references:
  - `src/shared/components/ui/sidebar.tsx` (use-mobile) — path changed in Phase 3
  - `src/modules/organizations/tasks/shared/ui/data-table/organization-tasks-table.tsx` (use-persisted-table-state) — path changed in Phase 2
  - `src/modules/organizations/referrals/shared/ui/my-referral-link-button.tsx` (use-referral-link-storage) — path changed in Phase 2
  - `src/modules/accounts/users/shared/ui/edit-username-form.tsx` (use-referral-link-storage) — path changed in Phase 2
- [ ] Remove empty `src/hooks/` directory
- [ ] Typecheck passes

> **Note:** Import paths for files in Phase 2 (UI moves) may have already changed. Apply this story after Phase 2 and use the updated paths.

---

### US-020: Move src/shared/data/ to src/shared/constants/
**Description:** As a developer, I want static data constants in `src/shared/constants/` per the established convention. The `src/shared/data/` directory is not defined in AGENTS.md.

**Acceptance Criteria:**
- [ ] Move `src/shared/data/brazilian-cities-by-state.ts` to `src/shared/constants/brazilian-cities-by-state.ts`
- [ ] Update 2 import references:
  - `src/modules/accounts/users/shared/ui/edit-address-form.tsx` — path changed in Phase 2
  - `src/modules/accounts/onboarding/shared/ui/register-and-join-form.tsx` — path changed in Phase 2
- [ ] Remove empty `src/shared/data/` directory
- [ ] Typecheck passes

> **Note:** Import paths for the UI files may have changed in Phase 2. Apply after Phase 2.

---

## Phase 5: Standardize use-case comment format (4 files)

### US-021: Standardize step comments in tasks use-cases
**Description:** As a developer, I want all use-cases to follow the same numbered step comment format defined in AGENTS.md so the codebase is consistent and readable.

4 use-cases in the tasks module use `// Step N: description` instead of the standard block format:
```ts
// ============================================================
// 0) Description
//
// Possibilidades:
// - scenario 1
// - scenario 2
// ============================================================
```

**Acceptance Criteria:**
- [ ] Update step comments in `create-task.use-case.ts` to standard block format
- [ ] Update step comments in `assign-users-to-task.use-case.ts` to standard block format
- [ ] Update step comments in `get-assignable-users.use-case.ts` to standard block format
- [ ] Update step comments in `get-tasks-for-table.use-case.ts` to standard block format
- [ ] Each step block includes description and expected outcomes ("Possibilidades")
- [ ] Typecheck passes

---

## Phase 6: Update AGENTS.md documentation

### US-022: Update AGENTS.md to reflect current state
**Description:** As a developer, I want AGENTS.md to accurately describe all valid directories and conventions so new contributors and agents follow the correct patterns.

**Acceptance Criteria:**
- [ ] Remove `src/shared/storage/` from the documented structure (was deleted in US-006)
- [ ] Add `src/shared/hooks/` to documented structure (created in US-019)
- [ ] Add `src/lib/providers/` to documented structure (created in US-018)
- [ ] Replace all references to `src/components/` with `src/shared/components/` (moved in Phase 3)
- [ ] Document `src/shared/components/ui/` as the shadcn/ui primitives location
- [ ] Document `src/shared/components/` as the composed global components location
- [ ] Add note that shadcn components use `function` declarations (accepted exception)
- [ ] Verify all documented paths match actual directory structure

---

## Functional Requirements

- FR-1: All module UI components must live in `src/modules/<module>/shared/ui/`, never in `src/modules/<module>/ui/`
- FR-2: All imports must use absolute `@/` alias, no relative imports (`../`, `./`)
- FR-3: `src/shared/` must contain only pure helpers without SDK coupling
- FR-4: `src/lib/` must contain only third-party SDK wrappers
- FR-5: Use-cases must only call Services, never Actions or Repos directly
- FR-6: Repos must contain zero business logic
- FR-7: All use-case step comments must follow the standard block format
- FR-8: No barrel files (`index.ts`) anywhere in `src/`
- FR-9: Avoid `any` types; use proper typing from library definitions
- FR-10: AGENTS.md must be kept in sync with actual directory structure
- FR-11: shadcn/ui primitives must live in `src/shared/components/ui/`
- FR-12: Composed global components must live in `src/shared/components/`
- FR-13: `src/components/` must not exist — all global UI consolidated under `src/shared/components/`

## Non-Goals

- Refactoring shadcn/ui components from `function` declarations to arrow functions (accepted library convention)
- Splitting or restructuring the `accounts/` module's nested submodule pattern (functional as-is)
- Adding tests for existing functionality (separate effort)
- Changing any runtime behavior — all changes are structural/organizational only

## Technical Considerations

- **Order of execution matters:**
  - Phase 2 (module UI moves) first — moves `<module>/ui/` to `<module>/shared/ui/`
  - Phase 3 (global components) second — moves `src/components/` to `src/shared/components/`
  - Phase 4 (directory relocations) last — files reference paths already changed in Phases 2-3
- **shadcn CLI config:** After moving UI primitives, update `components.json` so future `npx shadcn add` commands generate files in `src/shared/components/ui/`
- **Git history:** Use `git mv` for all file moves to preserve git history/blame
- **Biome formatting:** Run `npm run fix:biome` after each commit to ensure import ordering is correct
- **Commit strategy:** One commit per user story, following conventional commits in English
- **Risk — Phase 3 (US-015):** The shadcn migration is the highest-impact change with 33 files and ~139 import references touching nearly every component in the project
- **Risk — Phase 2 (US-011):** The memberships UI migration is the second largest with ~23 files and ~29 import references

## Success Metrics

- `npm run typecheck` passes with zero errors after all changes
- `npm run lint:biome` shows no new errors introduced
- Zero coupling violations (Service->Service, Action->Repo, Use-case->Action)
- Zero files in `<module>/ui/` outside of `shared/ui/`
- `src/components/` directory no longer exists
- All shadcn UI in `src/shared/components/ui/`
- All composed globals in `src/shared/components/`
- Zero relative imports in `src/modules/` and `src/app/`
- Zero barrel files (`index.ts`)
- AGENTS.md accurately reflects the directory structure
- `npx shadcn add` generates files in the correct new location

## Open Questions

- Should we consider creating a lint rule or CI check to prevent future `ui/` folders outside `shared/ui/`?
- Should we add a section to AGENTS.md documenting the `.step.ts` naming pattern used in the onboarding module?
- Should `data-table-skeleton.tsx` (0 imports — orphaned) be deleted during the migration?
