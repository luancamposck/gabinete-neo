// src/types/domain/tasks/organization-task-assignments-with-user.types.d.ts

import type { PublicUserRow } from "@/types/domain/users/user-base.types"
import type { OrganizationTaskAssignmentRow } from "./organization-task-assignments.types"

/**
 * Assignment de task com dados básicos do usuário joinados.
 *
 * Corresponde ao select:
 *  organization_id,
 *  task_id,
 *  user_id,
 *  role,
 *  created_at,
 *  user: users!organization_task_assignments_user_id_fkey (id, name, email)
 */
export interface OrganizationTaskAssignmentWithUser {
	organization_id: OrganizationTaskAssignmentRow["organization_id"]
	task_id: OrganizationTaskAssignmentRow["task_id"]
	user_id: OrganizationTaskAssignmentRow["user_id"]
	role: OrganizationTaskAssignmentRow["role"]
	created_at: OrganizationTaskAssignmentRow["created_at"]

	user: Pick<PublicUserRow, "id" | "name" | "email">
}
