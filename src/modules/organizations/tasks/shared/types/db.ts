import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"

// organization_tasks
export type OrganizationTaskRow = Tables<"organization_tasks">
export type OrganizationTaskInsert = TablesInsert<"organization_tasks">
export type OrganizationTaskUpdate = TablesUpdate<"organization_tasks">
export type OrganizationTaskStatus = OrganizationTaskRow["status"]
export type OrganizationTaskDueAt = OrganizationTaskRow["due_at"]

// organization_task_assignments
export type OrganizationTaskAssignmentRow = Tables<"organization_task_assignments">
export type OrganizationTaskAssignmentInsert = TablesInsert<"organization_task_assignments">
export type OrganizationTaskAssignmentUpdate = TablesUpdate<"organization_task_assignments">
export type OrganizationTaskAssignmentRole = OrganizationTaskAssignmentRow["role"]
