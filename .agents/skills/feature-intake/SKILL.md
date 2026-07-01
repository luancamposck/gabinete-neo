---
name: feature-intake
description: "Turn an abstract or loosely defined feature idea into a clear feature brief saved to a file. Use when the user wants to plan, clarify, or structure a new feature before any implementation. Triggers on: feature intake, clarify feature, structure idea, create brief, plan scope, turn idea into brief."
---

# Feature Intake

Turn an abstract or loosely defined feature idea into a clear, practical feature brief saved to a file.

This skill should be used at the beginning of new feature planning, before any implementation work.

---

## Goal

Receive an initial feature idea from the user and turn it into a feature brief that makes clear:

* what problem will be solved;
* who will use the feature;
* what the main flow is;
* what is included in the initial scope;
* what is out of scope;
* what integrations, data, or dependencies may exist;
* what criteria indicate that the feature is well-defined;
* what risks or open questions need to be considered.

---

## Main Rules

* Always save the brief to a file.
* Do not implement code.
* Do not modify files outside the feature folder.
* Do not create additional documents besides the brief.
* Do not assume important decisions without asking.
* Ask questions only when they are necessary to better define the scope.
* Keep the brief direct, practical, and useful for later planning.

---

## Folder Structure

Always create or reuse a folder inside `tasks/` using this pattern:

```txt
tasks/[YYMMDD]-[feature-name]/
```

Rules:

* `YYMMDD` represents the current date.
* `[feature-name]` must be in kebab-case.
* The folder name must represent the feature in a short and clear way.

Example:

```txt
tasks/260630-connect-whatsapp/
```

---

## Output File

Always save the brief to this file:

```txt
tasks/[YYMMDD]-[feature-name]/01-brief.md
```

Example:

```txt
tasks/260630-connect-whatsapp/01-brief.md
```

Do not include the feature name in the file name, because the parent folder already identifies the feature.

Use:

```txt
01-brief.md
```

Avoid:

```txt
01-brief-connect-whatsapp.md
```

If `01-brief.md` already exists, update the file instead of creating duplicates.

---

## When to Use

Use this skill when the user brings an abstract or loosely defined idea.

Examples:

* "I want to add WhatsApp connection."
* "I need to create a billing area."
* "I want to improve onboarding."
* "Let's create notifications."
* "I have an idea for a dashboard, but it is still vague."
* "Before planning, help me organize this feature."

---

## When Not to Use

Do not use this skill when:

* the user asks for direct implementation;
* the change is small and objective;
* the scope is already completely defined;
* the user only asks for a code change;
* the user asks for bug analysis;
* the user asks for review of existing code.

---

## Step 1: Understand the Initial Idea

Start by restating the user's idea in a short paragraph.

Then identify what is still undefined.

Focus on the points that truly affect scope:

* problem to solve;
* target user;
* main flow;
* required data;
* external integrations;
* permissions or authentication;
* limits of the first version;
* technical or product risks;
* success criteria.

Do not turn the idea into a detailed technical solution before understanding the goal.

---

## Step 2: Ask Essential Questions

Ask 3 to 7 questions, only when necessary.

Prefer questions with lettered options so the user can answer quickly.

Recommended format:

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

Questions must remove real ambiguity. Avoid generic or unnecessary questions.

---

## Step 3: Generate the Brief

After gathering the necessary information, generate the brief using this format:

```markdown
# Feature Brief: [Feature Name]

## 1. Summary
Explain the feature in 2-4 sentences.

## 2. Problem
Describe the problem this feature solves and why it matters.

## 3. Target Users
List who will use the feature.

## 4. Main Flow
Describe the main flow in clear steps.

## 5. In Scope
List what should be part of the first version.

## 6. Out of Scope
List what explicitly should not be part of the first version.

## 7. Data and Integrations
List relevant data, APIs, authentication, permissions, external services, or other dependencies.

## 8. Success Criteria
List concrete signs that the feature is well-defined and ready to move forward.

## 9. Risks and Open Questions
List risks, doubts, dependencies, or decisions that still need attention.

## 10. Recommended Next Step
Indicate the most appropriate next step to move forward safely.
```

---

## Quality Rules

A good brief must be:

* clear;
* specific;
* small enough to avoid uncontrolled scope;
* honest about doubts and risks;
* explicit about what is out of scope;
* useful for someone who does not yet know the idea;
* focused on the product and flow, not premature implementation.

Avoid vague phrases like:

* "improve the experience";
* "make it easier";
* "work correctly";
* "handle edge cases";
* "create something modern";
* "make a beautiful screen".

Replace them with concrete and verifiable behavior.

---

## Final Behavior

When finished:

1. Create or update the feature folder at `tasks/[YYMMDD]-[feature-name]/`.
2. Save the brief to `01-brief.md`.
3. Tell the user the saved path.
4. Provide a short summary of the brief.
5. Recommend the next step.

Final response format:

```txt
Brief saved to: tasks/[YYMMDD]-[feature-name]/01-brief.md

Summary:
[short summary]

Recommended next step:
[next step]
```
