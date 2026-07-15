import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationTaskInsert } from "@/modules/organizations/tasks/shared/types/db"

export async function insertOrganizationTaskAdminRepo(insertParams: OrganizationTaskInsert) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("tasks").insert(insertParams).select("id").single()
}
