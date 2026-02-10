import { createAdminClient } from "@/lib/supabase/admin"

type InsertRolePermissionsAdminRepoParams = {
	roleId: string
	permissionIds: string[]
}

export function insertRolePermissionsAdminRepo({ roleId, permissionIds }: InsertRolePermissionsAdminRepoParams) {
	const supabaseAdmin = createAdminClient()
	const rows = permissionIds.map((permissionId) => ({
		role_id: roleId,
		permission_id: permissionId
	}))

	return supabaseAdmin.from("role_permissions").upsert(rows, { onConflict: "role_id,permission_id", ignoreDuplicates: true })
}
