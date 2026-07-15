import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationTaskAssignmentInsert } from "@/modules/organizations/tasks/shared/types/db"

export async function insertManyTaskAssignmentsAdminRepo(params: { assignments: OrganizationTaskAssignmentInsert[] }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("task_assignments").insert(params.assignments).select("organization_id, task_id, user_id")
}
