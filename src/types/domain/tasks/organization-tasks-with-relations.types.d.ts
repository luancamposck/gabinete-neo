// src/types/domain/tasks/organization-tasks-with-relations.types.ts

import type { PublicUserRow } from "@/types/domain/users/user-base.types"
import type { OrganizationTaskRow } from "./organization-tasks.types"

/**
 * Task com usuário criador “joinado” pelo Supabase.
 *
 * Corresponde ao select:
 *  id,
 *  title,
 *  description,
 *  status,
 *  due_at,
 *  created_at,
 *  created_by: users!organization_tasks_created_by_user_id_fkey (id, name, email)
 */
export interface OrganizationTaskWithCreator {
	id: OrganizationTaskRow["id"]
	title: OrganizationTaskRow["title"]
	description: OrganizationTaskRow["description"]
	status: OrganizationTaskRow["status"]
	due_at: OrganizationTaskRow["due_at"]
	created_at: OrganizationTaskRow["created_at"]
	created_by: Pick<PublicUserRow, "id" | "name" | "email"> | null
}
