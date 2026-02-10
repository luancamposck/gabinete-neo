import { createAdminClient } from "@/lib/supabase/admin"

type DeleteRolePermissionsAdminRepoParams = {
	roleId: string
	permissionIds: string[]
}

export function deleteRolePermissionsAdminRepo({ roleId, permissionIds }: DeleteRolePermissionsAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("role_permissions").delete().eq("role_id", roleId).in("permission_id", permissionIds)
}
