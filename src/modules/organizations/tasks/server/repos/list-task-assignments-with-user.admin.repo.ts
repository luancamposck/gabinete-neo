import { createAdminClient } from "@/lib/supabase/admin"

export type TaskAssignmentWithUser = {
	organization_id: string
	task_id: string
	user_id: string
	role: string
	created_at: string
	user: {
		id: string
		name: string
		email: string
	}
}

export async function listTaskAssignmentsWithUserAdminRepo(params: { taskId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
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
		.eq("task_id", params.taskId)
		.order("created_at", { ascending: true })
}
