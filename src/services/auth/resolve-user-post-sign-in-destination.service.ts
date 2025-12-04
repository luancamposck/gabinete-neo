import { getPendingOrganizationInviteByUserIdRepo } from "@/repositories/organization-invites/organization-invites.repo"
import { findOrganizationMembershipByUserAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

interface ResolveUserPostSignInDestinationInput {
	userId: string
}

type ResolveUserPostSignInDestinationOutput = OperationResponse<{ redirectTo: string }>

export default async function resolveUserPostSignInDestinationService({ userId }: ResolveUserPostSignInDestinationInput): Promise<ResolveUserPostSignInDestinationOutput> {
	// 1) Membership ativa
	const { data: membership, error: membershipError } = await findOrganizationMembershipByUserAdminRepo({ userId })

	if (membershipError) {
		console.error("[resolveUserPostSignInDestinationService] erro ao buscar membership do usuário:", membershipError)

		return {
			success: false,
			message: "Algo deu errado ao buscar organizações do usuário"
		}
	}

	if (membership) {
		return {
			success: true,
			message: "Usuário já possui organização ativa.",
			data: { redirectTo: "/dashboard" }
		}
	}

	// 2) Invite pendente
	const { data: pendingInvite, error: pendingInviteError } = await getPendingOrganizationInviteByUserIdRepo({ userId })

	if (pendingInviteError) {
		console.error("[resolveUserPostSignInDestinationService] erro ao buscar convites pendentes:", pendingInviteError)

		return {
			success: false,
			message: "Algo deu errado ao buscar convites do usuário"
		}
	}

	if (pendingInvite) {
		return {
			success: true,
			message: "Usuário aguarda aprovação de convite.",
			data: { redirectTo: "/invite-pending" }
		}
	}

	// 3) Sem org e sem convite pendente
	return {
		success: true,
		message: "Usuário não possui organização nem convite pendente.",
		data: { redirectTo: "/no-organization" }
	}
}
