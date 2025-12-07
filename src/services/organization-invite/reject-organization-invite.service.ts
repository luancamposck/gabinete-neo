// src/services/reject-organization-invite.service.ts

import { findOrganizationInviteByIdAdminRepo, updateOrganizationInviteStatusAdminRepo } from "@/repositories/organization-invites/organization-invites.admin.repo"
import { findOrganizationMembershipByUserIdAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

interface RejectOrganizationInviteInput {
	inviteId: string
	approverUserId: string
}

export async function rejectOrganizationInviteService({ inviteId, approverUserId }: RejectOrganizationInviteInput): Promise<OperationResponse<null>> {
	// 1) Carregar invite
	const { data: invite, error: inviteError } = await findOrganizationInviteByIdAdminRepo({
		inviteId
	})

	if (inviteError || !invite) {
		console.error("[rejectOrganizationInviteService] erro ao buscar invite:", inviteError)
		return {
			success: false,
			message: "Convite não encontrado."
		}
	}

	if (invite.status !== "PENDING") {
		return {
			success: false,
			message: "Este convite já foi processado."
		}
	}

	// (opcional) se você quiser impedir rejeição de convites expirados,
	// pode manter esse check igual ao da approve:
	if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
		return {
			success: false,
			message: "Este convite expirou."
		}
	}

	// 2) Verificar se approver é OWNER/ADMIN da org do invite
	const { data: approverMembership, error: approverMembershipError } = await findOrganizationMembershipByUserIdAdminRepo({ userId: approverUserId })

	if (approverMembershipError || !approverMembership) {
		console.error("[rejectOrganizationInviteService] erro ao buscar membership do aprovador:", approverMembershipError)
		return {
			success: false,
			message: "Você não tem permissão para rejeitar este convite."
		}
	}

	if (approverMembership.organization_id !== invite.organization_id || !["OWNER", "ADMIN"].includes(approverMembership.role)) {
		return {
			success: false,
			message: "Você não tem permissão para rejeitar este convite."
		}
	}

	// 3) Atualizar invite -> REJECTED
	const updateInviteRes = await updateOrganizationInviteStatusAdminRepo({
		inviteId: invite.id,
		status: "REJECTED",
		handledByUserId: approverUserId
	})

	if (updateInviteRes.error) {
		console.error("[rejectOrganizationInviteService] erro ao atualizar status do invite:", updateInviteRes.error)

		return {
			success: false,
			message: "Não foi possível rejeitar o convite. Tente novamente."
		}
	}

	return {
		success: true,
		message: "Convite rejeitado com sucesso.",
		data: null
	}
}
