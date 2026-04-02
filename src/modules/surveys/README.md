# Surveys module notes

## Automated test entry point

- Run `npm run test:surveys` to execute the automated suite scoped to `src/modules/surveys`.
- Run `npm run test:surveys:watch` during local development.
- Add new automated coverage under `src/modules/surveys/**` using `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx`.
- The surveys Vitest config lives at `vitest.surveys.config.ts`, so CI and local execution use the same entry point without extra path flags.

## Hybrid anti-duplicate strategy (responses)

This module enforces a hybrid strategy to prevent duplicate survey submissions:

1. **Authenticated user (non-anonymous response)**
   - uniqueness key: `(survey_id, respondent_user_id)`

2. **Unauthenticated user OR anonymous response**
   - the server generates `responder_fingerprint_hash` using HMAC with:
     - `survey_id`
     - stable HttpOnly responder cookie (`sr_rid`)
     - auxiliary signal hash (IP hash with rotating salt + user-agent)
   - uniqueness key: `(survey_id, responder_fingerprint_hash)`

### Privacy and security constraints

- Raw IP is never persisted.
- If IP is used as an auxiliary signal, it is immediately hashed with a rotating daily salt.
- The stable responder cookie is HttpOnly and opaque (no raw personal identifier).
- Duplicate attempts are mapped to the business error code: `already_answered`.

### Technical limitation (anonymous mode)

In fully anonymous mode there is always residual risk (e.g., cookie cleared, different device/browser, or network changes). The implemented strategy covers the primary "same person" scenario in regular usage.

---

## QA checklist (manual and automated)

> Goal: validate visibility, permissions, anonymity behavior, anti-duplicate constraints, and standardized error contracts.

### 0) Preconditions / fixtures

- Create two organizations: `org-a` and `org-b`.
- Users:
  - `owner-a` (organization owner in `org-a`)
  - `member-a` (organization member in `org-a`)
  - `outsider` (no membership in `org-a`)
  - `anonymous-browser` (incognito or signed-out)
- Create at least two surveys in `org-a`:
  - `survey-public` (`visibility = public`, `status = published`)
  - `survey-private` (`visibility = private`, `status = published`)
- Create one survey for anonymity checks:
  - `survey-no-anon` (`accept_anonymous_answers = false`, published)
  - `survey-with-anon` (`accept_anonymous_answers = true`, published)

---

### 1) Visibility and listing rules

#### 1.1 Public survey appears in `/surveys`

- **Manual**
  - Open `/surveys` as logged-out and logged-in users.
  - Validate `survey-public` is listed.
- **Automated**
  - Integration/e2e: `list-public-surveys` action returns `survey-public` when status is `published`.

#### 1.2 Public survey appears in `/dashboard/surveys`

- **Manual**
  - Login as `owner-a` and open `/dashboard/surveys`.
  - Validate `survey-public` appears in dashboard listing for `org-a`.
- **Automated**
  - Integration/e2e: `list-dashboard-surveys` returns public + private surveys for organization members.

#### 1.3 Private survey appears only in `/dashboard/surveys` for organization members

- **Manual**
  - `member-a` in `/dashboard/surveys`: sees `survey-private`.
  - Logged-out user in `/surveys`: does **not** see `survey-private`.
  - `outsider` in `/dashboard/surveys` (for `org-a` context): does **not** see `survey-private`.
- **Automated**
  - Integration/e2e: `list-public-surveys` excludes `visibility = private`.
  - Integration/e2e: `list-dashboard-surveys` checks organization membership before returning private entries.

---

### 2) Authorization (create/edit/publish)

#### 2.1 User without permission cannot create/edit/publish survey

- **Manual**
  - Login as `outsider` (or member without proper permission).
  - Try creating, editing, and publishing through UI and/or direct action call.
  - Validate operation is blocked.
- **Automated**
  - Action/use-case tests for `create-survey`, `update-survey`, and `publish-survey` with unauthorized principal.
  - Assert `OperationResponse.success === false` and `code === "not_allowed"` (or equivalent standardized code).

---

### 3) Anonymity behavior

#### 3.1 `accept_anonymous_answers = false` does not allow anonymous response

- **Manual**
  - Open `survey-no-anon` as authenticated user.
  - Verify UI does not allow selecting anonymity (or disables the option).
  - Attempt request tampering with `isAnonymous=true`; validate backend rejects.
- **Automated**
  - Service/use-case test: submit with `isAnonymous=true` when survey forbids anonymity.
  - Assert failed `OperationResponse` with standardized error code (`not_allowed` or dedicated code).

#### 3.2 `accept_anonymous_answers = true` allows choosing anonymity

- **Manual**
  - Open `survey-with-anon` and confirm anonymity selector/toggle is available.
  - Submit with `isAnonymous=true` and with `isAnonymous=false`; both should succeed (subject to duplicate rules).
- **Automated**
  - Action/use-case test with both values and valid payload.
  - Assert successful path and persisted flag behavior.

#### 3.3 Anonymous response does not expose identity in listing/export

- **Manual**
  - Submit anonymous response.
  - Open responses list and exports.
  - Validate no user-identifying fields are shown for anonymous responses.
- **Automated**
  - Repo/integration test for safe projection/view used by listing/export.
  - Assert identity fields are `null`/masked for `is_anonymous = true`.

---

### 4) Anti-duplicate protections

#### 4.1 Same authenticated user cannot respond twice to same survey

- **Manual**
  - Login as `member-a`.
  - Submit once to same survey.
  - Attempt second submission.
  - Validate second attempt is rejected.
- **Automated**
  - Integration test for unique key `(survey_id, respondent_user_id)` path.
  - Assert second call fails with `code = "already_answered"`.

#### 4.2 Same browser/device in anonymous flow cannot respond twice (hash/cookie)

- **Manual**
  - In one browser session (same cookie/device), submit anonymously.
  - Submit second time to same survey.
  - Validate second attempt is blocked.
- **Automated**
  - Integration test with fixed cookie/fingerprint context.
  - Assert uniqueness by `(survey_id, responder_fingerprint_hash)` and `already_answered` code.

---

### 5) Standardized error codes/messages

#### 5.1 Error contract consistency (`already_answered`, `not_allowed`, etc.)

- **Manual**
  - Trigger each known failure path and inspect network response payload.
- **Automated**
  - Unit/integration tests for all action/use-case error branches.
  - Assert `{ success: false, code, message }` shape and canonical codes (`already_answered`, `not_allowed`, `validation_error`, `infra_error`, etc.).

---

### 6) Architecture guardrails from AGENTS.md

#### 6.1 Layering and coupling

- **Checklist (code review / static checks)**
  - Action -> Service or Use-case only.
  - Use-case -> Service(s) only.
  - Service -> exactly one Repo.
  - Repo -> data access only (no business rules).

#### 6.2 Naming and structure

- **Checklist**
  - Files follow required suffixes (`*.action.ts`, `*.use-case.ts`, `*.service.ts`, `*.repo.ts`).
  - Feature-first placement under `src/modules/surveys/server/...`.

#### 6.3 Contracts and validations

- **Checklist**
  - Server actions validate input with Zod.
  - Action/Service/Use-case return explicit `OperationResponse`.
  - Error codes are centralized and reused (no ad-hoc inline strings where avoidable).

---

## Suggested automated suite matrix (minimum)

- **Unit tests (service/use-case):**
  - permission denied (`not_allowed`)
  - duplicate authenticated (`already_answered`)
  - duplicate anonymous fingerprint (`already_answered`)
  - anonymity forbidden (`not_allowed` or dedicated code)
- **Integration tests (repo + database constraints/views):**
  - public vs private visibility queries
  - unique indexes and trigger-enforced anonymity rules
  - safe listing/export projections for anonymous responses
- **E2E tests (critical UX):**
  - `/surveys` visibility
  - `/dashboard/surveys` visibility by role/membership
  - full submit flow (anonymous enabled/disabled)
