// src/actions/reject-organization-invite.action.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { rejectOrganizationInviteService } from "@/services/organization-invite/reject-organization-invite.service"
import type { OperationResponse } from "@/types/operation-response"

export async function rejectOrganizationInviteAction(inviteId: string): Promise<OperationResponse<null>> {
	const supabase = await createClient()
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		return {
			success: false,
			message: "Usuário não autenticado."
		}
	}

	const approverUserId = user.id

	const serviceRes = await rejectOrganizationInviteService({
		inviteId,
		approverUserId
	})

	return serviceRes
}
