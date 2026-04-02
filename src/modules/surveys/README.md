# Surveys Module

## Automated checks

- Run `npm run test:surveys` for the surveys-focused Vitest suite.
- Run `npm run test:surveys:watch` during local development.
- Run the mandatory repository gate before finishing work:
  - `npm run fix:biome`
  - `npm run lint:biome`
  - `npm run typecheck`

## Implemented backend rules

### Tenant and visibility rules

- Public listing at `/surveys` returns only surveys for the current tenant that are:
  - `visibility = public`
  - `status = published`
  - currently inside the active `startsAt` and `endsAt` window
- Dashboard listing at `/dashboard/surveys` requires an authenticated active member and returns the current tenant's public and private surveys.
- Public survey detail resolves the tenant from the current host and classifies access as:
  - `accessible`
  - `draft`
  - `closed`
  - `unavailable`
- Cross-tenant survey access is rejected before loading a public detail DTO.

### Management authorization rules

- Survey management keeps the OWNER bypass.
- Non-owner members must have `surveys.manage`.
- Management context, publish, close, update, and results flows all enforce tenant-scoped membership before proceeding.
- Structural edits are blocked after the first response exists.
- Metadata-only edits remain allowed after responses.
- Publishing is only valid for `draft` surveys with at least one question.
- Closing is only valid for `published` surveys.

### Response submission rules

- Response submission resolves the tenant from the current host when possible and only falls back to an explicit `organizationId` when headers are unavailable.
- Surveys only accept responses when they are `published` and inside the active date window.
- Private surveys require an authenticated active member of the tenant organization.
- Public identified responses are supported for unauthenticated respondents.
- Unauthenticated identified responses must provide:
  - `respondent_name`
  - `respondent_email`
  - `respondent_phone`
- Anonymous responses keep those three fields as `null`.
- When `acceptAnonymousAnswers` is `false`, anonymous submission is rejected in the backend even if the request is tampered.
- Response payload validation rejects question IDs that do not belong to the loaded survey.
- Survey response headers and answer items are persisted atomically through one database RPC.

### Duplicate protection

- Authenticated non-anonymous responses dedupe on `(survey_id, respondent_user_id)`.
- Anonymous responses and unauthenticated identified public responses dedupe on `(survey_id, responder_fingerprint_hash)`.
- The responder fingerprint is derived from:
  - the survey ID
  - a stable HttpOnly responder cookie
  - a hashed auxiliary signal based on IP and user agent
- Duplicate attempts map to the business code `already_answered`.

### Residual fingerprint risk

- Anonymous and public unauthenticated dedupe is best-effort, not absolute.
- Residual risk remains when the respondent changes browser, device, cookie state, or network context.
- This residual risk is accepted in the current V1 contract to avoid storing raw personal identifiers for anonymous responses.

### Results and anonymity rules

- Results access is manager-only: OWNER or active member with `surveys.manage`.
- Objective results include:
  - counts and percentages for `single_choice`
  - counts and percentages for `checkbox`
  - `averageRank`, counts, and percentages for `ranking`
- Qualitative results include ordered `textarea` answers with `submittedAt`.
- Respondent identity is sourced from safe database views instead of raw response rows.
- Anonymous responses mask:
  - `respondent_user_id`
  - `respondent_name`
  - `respondent_email`
  - `respondent_phone`
- Identified public responses can expose the stored manual respondent snapshot only through the safe projection used by the dashboard results flow.

## QA checklist

### Automated QA

- Run `npm run test:surveys`.
- Run `npm run fix:biome`.
- Run `npm run lint:biome`.
- Run `npm run typecheck`.

### Manual QA

- Public surface:
  - Verify `/surveys` only shows public published surveys currently available for the tenant host.
  - Verify `/surveys/[surveyId]` renders question content for accessible surveys and shows blocked states for `closed` or out-of-window surveys.
- Public response modes:
  - Verify a survey with `acceptAnonymousAnswers = true` defaults to anonymous mode and lets the respondent switch to identified mode.
  - Verify a survey with `acceptAnonymousAnswers = false` hides anonymous mode and requires name, email, and phone before submit.
  - Verify successful anonymous submissions do not expose identity in dashboard results.
- Membership and private access:
  - Verify an active member can open dashboard survey detail and submit to private surveys.
  - Verify a non-member or inactive member cannot open private dashboard survey detail or submit responses.
- Management:
  - Verify OWNER can create, edit, publish, close, and inspect results without `surveys.manage`.
  - Verify a non-owner member needs `surveys.manage` for the same management flows.
  - Verify question and option structure becomes locked after the first response, while metadata fields remain editable.
- Duplicate protection:
  - Verify the same authenticated user cannot answer the same survey twice.
  - Verify the same browser session cannot anonymously answer the same survey twice.
- Results:
  - Verify dashboard results render objective aggregations and textarea answers.
  - Verify anonymous responses stay masked and identified public submissions show the stored respondent snapshot only in the manager results surface.

### Browser note

- Browser automation tooling was unavailable in the Ralph/Codex loop used to build this module.
- Manual browser verification is still required for UI-facing survey stories.
