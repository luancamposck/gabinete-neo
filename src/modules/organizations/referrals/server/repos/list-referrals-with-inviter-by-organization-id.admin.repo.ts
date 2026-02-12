import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationReferralRow } from "@/modules/organizations/referrals/shared/types/db"

export type OrganizationReferralWithInviterName = OrganizationReferralRow & {
	inviter_user: {
		name: string
	} | null
}

export async function listReferralsWithInviterByOrganizationIdAdminRepo(params: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("organization_referrals")
		.select(
			`
				*,
				inviter_user:users!organization_referrals_inviter_user_id_fkey (
					name
				)
			`
		)
		.eq("organization_id", params.organizationId)
		.order("created_at", { ascending: true })
}
