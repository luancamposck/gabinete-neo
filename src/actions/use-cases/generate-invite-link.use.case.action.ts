"use server"

import { generateInviteLinkUseCase } from "@/use-cases/generate-invite-link.use-case"

export async function generateInviteLinkUseCaseAction() {
	return generateInviteLinkUseCase()
}
