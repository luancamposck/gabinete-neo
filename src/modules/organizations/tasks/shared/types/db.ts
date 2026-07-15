import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

// tasks
export type OrganizationTaskRow = Tables<"tasks">
export type OrganizationTaskInsert = TablesInsert<"tasks">
export type OrganizationTaskUpdate = TablesUpdate<"tasks">
export type OrganizationTaskStatus = OrganizationTaskRow["status"]
export type OrganizationTaskDueAt = OrganizationTaskRow["due_at"]

// task_assignments
export type OrganizationTaskAssignmentRow = Tables<"task_assignments">
export type OrganizationTaskAssignmentInsert = TablesInsert<"task_assignments">
export type OrganizationTaskAssignmentUpdate = TablesUpdate<"task_assignments">
