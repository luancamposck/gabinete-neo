// src/services/approve-organization-invite.service.ts

import { findOrganizationInviteByIdAdminRepo, updateOrganizationInviteStatusAdminRepo } from "@/repositories/organization-invites/organization-invites.admin.repo"
import { deleteOrganizationMembershipAdminRepo, findOrganizationMembershipByUserAdminRepo, insertOrganizationMenbershipsAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

interface ApproveOrganizationInviteInput {
	inviteId: string
	approverUserId: string
}

export async function approveOrganizationInviteService({ inviteId, approverUserId }: ApproveOrganizationInviteInput): Promise<OperationResponse<null>> {
	// 1) Carregar invite
	const { data: invite, error: inviteError } = await findOrganizationInviteByIdAdminRepo({
		inviteId
	})

	if (inviteError || !invite) {
		console.error("[approveOrganizationInviteService] erro ao buscar invite:", inviteError)
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

	// (opcional) checar expirado
	if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
		return {
			success: false,
			message: "Este convite expirou."
		}
	}

	// 2) Verificar se approver é OWNER/ADMIN da org do invite
	const { data: approverMembership, error: approverMembershipError } = await findOrganizationMembershipByUserAdminRepo({ userId: approverUserId })

	if (approverMembershipError || !approverMembership) {
		console.error("[approveOrganizationInviteService] erro ao buscar membership do aprovador:", approverMembershipError)
		return {
			success: false,
			message: "Você não tem permissão para aprovar este convite."
		}
	}

	if (approverMembership.organization_id !== invite.organization_id || !["OWNER", "ADMIN"].includes(approverMembership.role)) {
		return {
			success: false,
			message: "Você não tem permissão para aprovar este convite."
		}
	}

	// 3) Verificar se o usuário já é membro de alguma org (regra: 1 user -> 1 org)
	const { data: existingMembership } = await findOrganizationMembershipByUserAdminRepo({
		userId: invite.requested_by_user_id
	})

	if (existingMembership) {
		return {
			success: false,
			message: "Este usuário já é membro de uma organização."
		}
	}

	// 4) Criar membership
	const insertMembershipRes = await insertOrganizationMenbershipsAdminRepo({
		organization_id: invite.organization_id,
		user_id: invite.requested_by_user_id,
		role: invite.role, // 'MEMBER' | 'ADMIN'
		is_active: true,
		invited_by_user_id: invite.created_by_user_id
	})

	if (insertMembershipRes.error) {
		console.error("[approveOrganizationInviteService] erro ao criar membership:", insertMembershipRes.error)

		return {
			success: false,
			message: "Não foi possível adicionar o usuário à organização."
		}
	}

	// Vamos guardar os dados do membership pra poder fazer rollback se precisar
	const createdMembership = insertMembershipRes.data

	// 5) Atualizar invite -> APPROVED
	const updateInviteRes = await updateOrganizationInviteStatusAdminRepo({
		inviteId: invite.id,
		status: "APPROVED",
		handledByUserId: approverUserId
	})

	if (updateInviteRes.error) {
		console.error("[approveOrganizationInviteService] erro ao atualizar status do invite:", updateInviteRes.error)

		// 🔁 ROLLBACK MANUAL DO MEMBERSHIP
		if (createdMembership) {
			try {
				const rollbackRes = await deleteOrganizationMembershipAdminRepo({
					organizationId: createdMembership.organization_id,
					userId: createdMembership.user_id
				})

				if (rollbackRes.error) {
					console.error("[approveOrganizationInviteService] erro ao tentar rollback do membership:", rollbackRes.error)
				}
			} catch (rollbackError) {
				console.error("[approveOrganizationInviteService] exceção ao tentar rollback do membership:", rollbackError)
			}
		}

		return {
			success: false,
			message: "Não foi possível aprovar o convite. As alterações foram revertidas. Tente novamente."
		}
	}

	return {
		success: true,
		message: "Convite aprovado com sucesso.",
		data: null
	}
}
