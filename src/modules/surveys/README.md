# Surveys module notes

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
