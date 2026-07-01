---
name: feature-intake
description: "Turn an abstract or loosely defined feature idea into a clear feature brief saved to a file. Use when the user wants to plan, clarify, or structure a new feature before any implementation. Triggers on: feature intake, clarify feature, structure idea, create brief, plan scope, turn idea into brief."
user-invocable: true
---

# Feature Intake

Turn an abstract or loosely defined feature idea into a clear, practical feature brief saved to a file. Use at the beginning of new feature planning, before any implementation work.

---

## Goal

Turn an initial feature idea into a brief that makes clear: the problem being solved, who uses it, the main flow, what is in/out of the initial scope, integrations/data/dependencies, criteria for "well-defined," and open risks/questions.

---

## Main Rules

* Always save the brief to a file.
* Do not implement code.
* Do not modify files outside the feature folder.
* Do not create additional documents besides the brief.
* Do not assume important decisions without asking.
* Ask questions only when necessary to define scope, not generic ones.
* Keep the brief direct, practical, and useful for later planning.

---

## Folder & Output File

Create or reuse:

```txt
tasks/[YYMMDD]-[feature-name]/01-brief.md
```

- `YYMMDD` = current date. `[feature-name]` = kebab-case, short and clear.
- Do not repeat the feature name in the filename because the folder already identifies it. Always use `01-brief.md`, never `01-brief-connect-whatsapp.md`.
- If `01-brief.md` already exists, update it instead of duplicating it.

Example: `tasks/260630-connect-whatsapp/01-brief.md`

---

## When to Use

Use for abstract or loosely defined ideas: "I want to add WhatsApp connection," "I need a billing area," "I have an idea for a dashboard, but it's still vague."

## When Not to Use

Do not use for direct implementation requests, small/objective changes, fully defined scopes, bug analysis, or code review requests.

---

## Step 1: Understand the Initial Idea

Restate the user's idea in a short paragraph, then identify what is still undefined. Focus only on what affects scope: problem, target user, main flow, required data, external integrations, permissions/auth, limits of v1, risks, and success criteria. Do not jump to a detailed technical solution before the goal is clear.

## Step 2: Ask Essential Questions

Ask 3-7 questions, only when necessary, with lettered options so the user can answer quickly:

```markdown
1. What is the main goal of this feature?
   A. Allow users to create something new
   B. Allow users to manage existing data
   C. Automate an internal process
   D. Integrate with an external service
   E. Other: [specify]

2. Who is the primary user?
   A. Public visitor
   B. Authenticated user
   C. Admin/operator
   D. Developer/internal team
   E. Multiple user types: [specify]

3. What scope should we target first?
   A. Minimal MVP
   B. Full version
   C. Backend/API only
   D. Interface only
   E. Discovery/technical validation only
```

Questions must remove real ambiguity. Skip anything generic.

## Step 3: Generate the Brief

```markdown
# Feature Brief: [Feature Name]

## 1. Summary
2-4 sentences.

## 2. Problem
What problem this solves and why it matters.

## 3. Target Users

## 4. Main Flow
Clear steps.

## 5. In Scope
What is part of v1.

## 6. Out of Scope
What is explicitly not part of v1.

## 7. Data and Integrations
APIs, auth, permissions, external services, and other dependencies.

## 8. Success Criteria
Concrete signs that the feature is well-defined and ready to move forward.

## 9. Risks and Open Questions

## 10. Recommended Next Step
```

---

## Quality Rules

A good brief is clear, specific, small enough to avoid uncontrolled scope, honest about doubts/risks, explicit about what is out of scope, understandable to someone new to the idea, and focused on product/flow, not premature implementation.

Avoid vague phrases ("improve the experience," "make it easier," "work correctly," "handle edge cases," "make it modern/beautiful"). Replace them with concrete, verifiable behavior.

---

## Final Behavior

1. Create/update `tasks/[YYMMDD]-[feature-name]/`.
2. Save the brief to `01-brief.md`.
3. Tell the user the saved path, a short summary, and the recommended next step:

```txt
Brief saved to: tasks/[YYMMDD]-[feature-name]/01-brief.md

Summary:
[short summary]

Recommended next step:
[next step]
```
