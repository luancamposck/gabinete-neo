---
name: shadcn-form
description: Create, refactor, or review forms in this project using shadcn/ui field components, React Hook Form, Zod, @hookform/resolvers, typed form data, accessible validation messages, and submit/loading states. Use when Codex needs to implement a form UI, add form validation, align an existing form with the local shadcn form pattern, or review form structure and accessibility.
---

# shadcn-form

Use this skill for form-layer work in this project: schema, component structure, field rendering, validation, accessibility, and basic submit handling.

Do not implement repositories, services, use-cases, or server actions unless the user explicitly asks for those pieces.

## Reference

Use `references/simple-sign-in-form.reference.md` as the default style guide for simple forms.

Read the reference when creating a new form or when the local pattern is unclear. It demonstrates the expected use of `Controller`, `Field`, `FieldLabel`, `FieldError`, `FieldGroup`, `InputGroup`, `InputGroupInput`, stable ids, `aria-invalid`, `data-invalid`, and `formState.isSubmitting`.

The reference is Markdown documentation only. Do not import, compile, lint, or typecheck it.

## Workflow

1. Inspect nearby form or UI code before editing.
2. Define a Zod schema and infer the form data type with `z.infer`.
3. Make React Hook Form components Client Components with `"use client"`.
4. Initialize `useForm<T>()` with `zodResolver(schema)` and explicit `defaultValues`.
5. Render fields with `Controller` when following the reference pattern.
6. Show field-level errors with `FieldError`.
7. Add loading/disabled submit behavior with `formState.isSubmitting`.
8. Validate with the narrowest relevant project checks after implementation.

## Schema Rules

Keep the schema in the same file for simple forms.

Extract the schema only when it is reused, large, shared with server-side code, the module already has a `schemas/` or `validations/` convention, or the user asks for separate files.

Use concise, user-facing validation messages. Match the app language already used by the surrounding feature.

## Component Rules

For simple text-like fields, prefer these local components:

- `Field`
- `FieldLabel`
- `FieldError`
- `FieldGroup`
- `InputGroup`
- `InputGroupInput`
- `Button`

Use stable ids from `useId` and connect labels with `htmlFor`.

Set `aria-invalid={fieldState.invalid}` on the control and `data-invalid={fieldState.invalid}` on `Field`.

Use useful `type` and `autoComplete` attributes for common inputs such as email, password, name, phone, and one-time codes.

Avoid placeholder-only labels, unnecessary local state, premature generic abstractions, masks, async lookups, multi-step flows, and advanced inputs unless required.

## Submit Rules

Do not create forms that receive submit functions as props by default.

For reference or placeholder forms, keep submit simple:

```tsx
async function onSubmit(data: FormData) {
	console.log(data)
}
```

For real project forms, import and call an existing action only when the user asks to connect the form to it. Do not create actions, services, repositories, or use-cases as part of ordinary form work.

Do not add global `submitError` state unless the form calls an action/API that can return a non-field error such as invalid credentials, permission denial, duplicate resource, server unavailability, or unexpected mutation failure.

## Review Checklist

Before finishing, check:

- schema fields match rendered fields
- all fields have explicit defaults
- labels are visible and connected
- validation errors render near fields
- invalid inputs expose `aria-invalid`
- submit is a real button and disables while submitting
- unrelated domain logic stayed out of the form component

In the final response after code changes, summarize changed files, schema fields, validation behavior, submit flow, components used, checks run, and assumptions.
