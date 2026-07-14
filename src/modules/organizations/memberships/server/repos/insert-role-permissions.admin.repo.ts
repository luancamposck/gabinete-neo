import { createAdminClient } from "@/lib/supabase/admin"

type InsertRolePermissionsAdminRepoParams = {
	roleId: string
	permissionKeys: string[]
}

export function insertRolePermissionsAdminRepo({ roleId, permissionKeys }: InsertRolePermissionsAdminRepoParams) {
	const supabaseAdmin = createAdminClient()
	const rows = permissionKeys.map((permissionKey) => ({
		role_id: roleId,
		permission_key: permissionKey
	}))

	return supabaseAdmin.from("role_permissions").upsert(rows, { onConflict: "role_id,permission_key", ignoreDuplicates: true })
}
