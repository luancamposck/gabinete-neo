import { createAdminClient } from "@/lib/supabase/admin"

type DeleteRolePermissionsAdminRepoParams = {
	roleId: string
	permissionKeys: string[]
}

export function deleteRolePermissionsAdminRepo({ roleId, permissionKeys }: DeleteRolePermissionsAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("role_permissions").delete().eq("role_id", roleId).in("permission_key", permissionKeys)
}
