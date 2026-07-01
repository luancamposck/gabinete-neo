// @/modules/fleet/server/repos/approve-driver-application.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

type Params = {
	applicationId: string
	reviewerUserId: string
}

/**
 * Espera existir a RPC transacional:
 * public.approve_driver_application(...) -> { driver_id, error_code }
 */
export async function approveDriverApplicationAdminRepo(params: Params) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.rpc("approve_driver_application", {
		p_application_id: params.applicationId,
		p_reviewer_user_id: params.reviewerUserId
	})
}
