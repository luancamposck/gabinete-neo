import { createAdminClient } from "@/lib/supabase/admin"

export type TaskAssignmentWithUser = {
	organization_id: string
	task_id: string
	user_id: string
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
		.from("task_assignments")
		.select(
			`
			organization_id,
			task_id,
			user_id,
			created_at,
			user:users!task_assignments_user_id_fkey (
				id,
				name,
				email
			)
		`
		)
		.eq("task_id", params.taskId)
		.order("created_at", { ascending: true })
}
