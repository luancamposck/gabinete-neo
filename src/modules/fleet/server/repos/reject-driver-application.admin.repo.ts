// @/modules/fleet/server/repos/reject-driver-application.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Marca a candidatura como 'rejected' apenas quando ainda está 'pending'
 * (guard de idempotência no próprio update). Não altera a membership do usuário.
 */
export async function rejectDriverApplicationAdminRepo(params: { applicationId: string; reviewerUserId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("driver_applications")
		.update({
			status: "rejected",
			reviewed_by_user_id: params.reviewerUserId,
			reviewed_at: new Date().toISOString()
		})
		.eq("id", params.applicationId)
		.eq("status", "pending")
		.select("id")
		.maybeSingle()
}
