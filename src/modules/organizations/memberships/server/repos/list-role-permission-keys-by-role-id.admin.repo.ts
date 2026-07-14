import { createAdminClient } from "@/lib/supabase/admin"

export function listRolePermissionKeysByRoleIdAdminRepo({ roleId }: { roleId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("role_permissions").select("permission_key").eq("role_id", roleId)
}
