// @/modules/organizations/referrals/server/repos/insert-referral.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationReferralInsert } from "@/modules/organizations/referrals/shared/types/db"

export async function insertOrganizationReferralAdminRepo(insertParams: OrganizationReferralInsert) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_referrals").insert(insertParams).select("id").single()
}
