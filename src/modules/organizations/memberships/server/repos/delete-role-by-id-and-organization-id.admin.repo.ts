import { createAdminClient } from "@/lib/supabase/admin"

type DeleteRoleByIdAndOrganizationIdAdminRepoParams = {
	roleId: string
	organizationId: string
}

export function deleteRoleByIdAndOrganizationIdAdminRepo(params: DeleteRoleByIdAndOrganizationIdAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("roles").delete().eq("id", params.roleId).eq("organization_id", params.organizationId).select("id").maybeSingle()
}
