// @/modules/fleet/server/repos/approve-driver-application.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { ApproveDriverApplicationAdminRepoData, ApproveDriverApplicationAdminRepoParams } from "@/modules/fleet/server/types/operations/approve-driver-application.types"

/**
 * Espera existir a RPC transacional:
 * public.approve_driver_application(...) -> { driver_id, error_code }
 */
export async function approveDriverApplicationAdminRepo(params: ApproveDriverApplicationAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	const { data, error } = await supabaseAdmin.rpc("approve_driver_application", {
		p_application_id: params.applicationId,
		p_reviewer_user_id: params.reviewerUserId
	})

	return {
		error,
		data: data as ApproveDriverApplicationAdminRepoData | null
	}
}
