"use server"

import { getMyReferralLinkUseCase } from "../use-cases/get-my-referral-link.use-case"

export async function getMyReferralLinkAction() {
	return getMyReferralLinkUseCase()
}
