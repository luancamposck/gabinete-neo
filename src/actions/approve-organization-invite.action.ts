// src/actions/approve-organization-invite.action.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { approveOrganizationInviteService } from "@/services/organization-invite/approve-organization-invite.service"
import type { OperationResponse } from "@/types/operation-response"

export async function approveOrganizationInviteAction(inviteId: string): Promise<OperationResponse<null>> {
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

	const serviceRes = await approveOrganizationInviteService({
		inviteId,
		approverUserId
	})

	// service já retorna OperationResponse<null>
	return serviceRes
}
