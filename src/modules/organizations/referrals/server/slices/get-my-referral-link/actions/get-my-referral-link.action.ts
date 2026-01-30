// @/modules/organizations/referrals/server/slices/get-my-referral-link/actions/get-my-referral-link.action.ts
"use server"

import { getMyReferralLinkUseCase } from "@/modules/organizations/referrals/server/slices/get-my-referral-link/use-cases/get-my-referral-link.use-case"

export async function getMyReferralLinkAction() {
	return getMyReferralLinkUseCase()
}
