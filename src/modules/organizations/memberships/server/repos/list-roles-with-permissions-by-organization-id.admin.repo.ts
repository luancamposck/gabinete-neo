import { createAdminClient } from "@/lib/supabase/admin"

export function listRolesWithPermissionsByOrganizationIdAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("roles")
		.select("id,name,is_active,is_system,role_permissions(permission:permissions(key,description))")
		.eq("organization_id", organizationId)
		.eq("is_active", true)
		.order("name", { ascending: true })
}
