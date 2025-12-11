// src/repositories/organization-task-assignments/organization-task-assignments.repo.ts

import { createClient } from "@/lib/supabase/server"
import type { OrganizationTaskAssignmentInsert } from "@/types/domain/tasks/organization-task-assignments.types"

export async function insertManyOrganizationTaskAssignmentsRepo({ assignments }: { assignments: OrganizationTaskAssignmentInsert[] }) {
	const supabase = await createClient()

	return supabase.from("organization_task_assignments").insert(assignments).select("organization_id, task_id, user_id")
}

export async function listOrganizationTaskAssignmentsWithUserByTaskIdRepo({ taskId }: { taskId: string }) {
	const supabase = await createClient()

	return supabase
		.from("organization_task_assignments")
		.select(
			`
      organization_id,
      task_id,
      user_id,
      role,
      created_at,
      user:users!organization_task_assignments_user_fk (
        id,
        name,
        email
      )
    `
		)
		.eq("task_id", taskId)
		.order("created_at", { ascending: true })
}
