// src/types/domain/tasks/organization-tasks.types.ts

import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"

export type OrganizationTaskRow = Tables<"organization_tasks">
export type OrganizationTaskInsert = TablesInsert<"organization_tasks">
export type OrganizationTaskUpdate = TablesUpdate<"organization_tasks">

// Enum de status, derivado diretamente da coluna
export type OrganizationTaskStatus = OrganizationTaskRow["status"]
export type OrganizationTaskDueAt = OrganizationTaskRow["due_at"] // timestamptz | null
