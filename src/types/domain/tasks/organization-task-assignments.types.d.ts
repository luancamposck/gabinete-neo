// src/types/domain/tasks/organization-task-assignments.types.d.ts

import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"

export type OrganizationTaskAssignmentRow = Tables<"organization_task_assignments">
export type OrganizationTaskAssignmentInsert = TablesInsert<"organization_task_assignments">
export type OrganizationTaskAssignmentUpdate = TablesUpdate<"organization_task_assignments">

export type OrganizationTaskAssignmentRole = OrganizationTaskAssignmentRow["role"]
