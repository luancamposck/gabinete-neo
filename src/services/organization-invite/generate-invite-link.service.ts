// src/services/generate-invite-link.service.ts

import { signInviteToken } from "@/lib/utils/token-utils"
import { getCurrentAuthUserRepo } from "@/repositories/auth-users/auth-users.repo"
import { findOrganizationMembershipByUserAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

interface GenerateInviteLinkServiceParams {
	organizationId: string
	organizationSlug: string
}

export async function generateInviteLinkService(params: GenerateInviteLinkServiceParams): Promise<OperationResponse<{ inviteUrl: string }>> {
	const { organizationId, organizationSlug } = params

	// 1) pega user logado via repo (auth)
	const { data, error } = await getCurrentAuthUserRepo()

	if (error || !data?.user) {
		console.error("[generateInviteLinkService] Usuário não autenticado:", error)

		return {
			success: false,
			message: "É necessário estar autenticado para gerar um link de convite."
		}
	}

	const inviterUserId = data.user.id

	// 2) busca membership pelo user (1 user = 1 org)
	const { data: membership, error: membershipError } = await findOrganizationMembershipByUserAdminRepo({ userId: inviterUserId })

	if (membershipError || !membership) {
		console.error("[generateInviteLinkService] Membership não encontrado:", membershipError)

		return {
			success: false,
			message: "Nenhuma organização encontrada para este usuário."
		}
	}

	// Confere se a org da page bate com a do membership (defesa extra)
	if (membership.organization_id !== organizationId) {
		console.error("[generateInviteLinkService] organizationId da página não bate com membership:", { fromPage: organizationId, fromMembership: membership.organization_id })

		return {
			success: false,
			message: "Você não faz parte desta organização."
		}
	}

	if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
		return {
			success: false,
			message: "Você não tem permissão para convidar usuários para esta organização."
		}
	}

	// 3) gera o token
	const token = await signInviteToken({
		organizationId,
		inviterUserId,
		kind: "PUBLIC_JOIN_LINK"
	})

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
	const inviteUrl = `${baseUrl}/${organizationSlug}/invite?token=${token}`

	return {
		success: true,
		message: "Link de convite gerado com sucesso.",
		data: { inviteUrl }
	}
}
