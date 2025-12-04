// src/actions/generate-invite-link.action.ts
"use server"

import { z } from "zod"
import { generateInviteLinkService } from "@/services/organization-invite/generate-invite-link.service"
import type { OperationResponse } from "@/types/operation-response"

const generateInviteLinkSchema = z.object({
	organizationId: z.string().min(1),
	organizationSlug: z.string().min(1)
})

export async function generateInviteLinkAction(formData: unknown): Promise<OperationResponse<{ inviteUrl: string }>> {
	const parsed = generateInviteLinkSchema.safeParse(formData)

	if (!parsed.success) {
		console.error("[generateInviteLinkAction] validação:", parsed.error)
		return {
			success: false,
			message: parsed.error.message
		}
	}

	const { organizationId, organizationSlug } = parsed.data

	const res = await generateInviteLinkService({ organizationId, organizationSlug })

	if (!res.success || !res.data) {
		return {
			success: false,
			message: res.message
		}
	}

	return {
		success: true,
		message: res.message,
		data: {
			inviteUrl: res.data.inviteUrl
		}
	}
}
