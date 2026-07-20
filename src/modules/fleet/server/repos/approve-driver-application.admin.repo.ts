// @/modules/fleet/server/repos/approve-driver-application.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { ApproveDriverApplicationAdminRepoData } from "@/modules/fleet/shared/types/slices/review-driver-application.types"

/**
 * Espera existir a RPC transacional:
 * public.approve_driver_application(...) -> { driver_id, error_code }
 */
export async function approveDriverApplicationAdminRepo(params: { applicationId: string; reviewerUserId: string }) {
	const supabaseAdmin = createAdminClient()

	const { data, error } = await supabaseAdmin.rpc("approve_driver_application", {
		p_application_id: params.applicationId,
		p_reviewer_user_id: params.reviewerUserId
	})

	return { data: data as ApproveDriverApplicationAdminRepoData | null, error }
}
