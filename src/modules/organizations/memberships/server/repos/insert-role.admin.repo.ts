import { createAdminClient } from "@/lib/supabase/admin"

type InsertRoleAdminRepoParams = {
	organizationId: string
	name: string
	isSystem: boolean
	isActive: boolean
}

export function insertRoleAdminRepo(params: InsertRoleAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("roles")
		.insert({
			organization_id: params.organizationId,
			name: params.name,
			is_system: params.isSystem,
			is_active: params.isActive
		})
		.select("id,organization_id,name,is_system,is_active")
		.single()
}
