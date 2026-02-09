// @/modules/auth/server/repos/list-membership-permissions.repo.ts
import { createClient } from "@/lib/supabase/server"

type Params = {
	organizationId: string
	userId: string
}

/**
 * Espera existir a RPC:
 * public.list_membership_permissions(uuid, uuid) -> text[]
 */
export async function listMembershipPermissionsRepo(params: Params) {
	const supabase = await createClient()

	return supabase.rpc("list_membership_permissions", {
		p_organization_id: params.organizationId,
		p_user_id: params.userId
	})
}
