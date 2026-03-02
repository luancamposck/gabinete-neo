import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationReferralRow } from "@/modules/organizations/referrals/shared/types/db"

export type OrganizationReferralWithInviterName = OrganizationReferralRow & {
	inviter_user: {
		name: string
		email: string
	} | null
	invited_user: {
		name: string
		email: string
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
					name,
					email
				),
				invited_user:users!organization_referrals_invited_user_id_fkey (
					name,
					email
				)
			`
		)
		.eq("organization_id", params.organizationId)
		.order("created_at", { ascending: true })
}
