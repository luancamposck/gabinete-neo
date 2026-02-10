import { createAdminClient } from "@/lib/supabase/admin"

export function listRolePermissionIdsByRoleIdAdminRepo({ roleId }: { roleId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("role_permissions").select("permission_id").eq("role_id", roleId)
}
