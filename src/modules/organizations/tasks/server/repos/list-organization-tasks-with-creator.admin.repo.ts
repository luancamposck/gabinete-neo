import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationTaskStatus } from "@/modules/organizations/tasks/shared/types/db"

export type OrganizationTaskWithCreator = {
	id: string
	title: string
	description: string | null
	status: OrganizationTaskStatus
	due_at: string | null
	created_at: string
	created_by: {
		id: string
		name: string
		email: string
	} | null
}

export async function listOrganizationTasksWithCreatorAdminRepo(params: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("organization_tasks")
		.select(
			`
			id,
			title,
			description,
			status,
			due_at,
			created_at,
			created_by:users!organization_tasks_created_by_user_id_fkey (
				id,
				name,
				email
			)
		`
		)
		.eq("organization_id", params.organizationId)
		.order("created_at", { ascending: false })
}
