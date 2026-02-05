// @/modules/auth/server/repos/exists-permission-for-membership.repo.ts
import { createClient } from "@/lib/supabase/server"
import type { PermissionKey } from "@/modules/auth/shared/permissions"

type Params = {
	organizationId: string
	userId: string
	permissionKey: PermissionKey
}

/**
 * Espera existir a RPC: public.has_membership_permission(uuid, uuid, text) -> boolean
 */
export async function existsPermissionForMembershipRepo(params: Params) {
	const supabase = await createClient()

	return supabase.rpc("has_membership_permission", {
		p_organization_id: params.organizationId,
		p_user_id: params.userId,
		p_permission_key: params.permissionKey
	})
}
