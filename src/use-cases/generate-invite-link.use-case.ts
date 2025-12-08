import { getCurrentAuthSessionService } from "@/services/auth/get-current-auth-session.service"
import { getOrganizationByIdService } from "@/services/organization"
import { getOrganizationMembershipByUserIdService } from "@/services/organization-membership/get-organization-membership-by-user-id.service"
import type { OperationResponse } from "@/types/operation-response"

export async function generateInviteLinkUseCase(): Promise<OperationResponse<{ inviteLink: string }>> {
	// 1) Pegar uuid do user
	const getCurrentAuthSessionServiceRes = await getCurrentAuthSessionService()
	if (getCurrentAuthSessionServiceRes.success === false) {
		return {
			success: false,
			message: "Não foi possível gerar link de convite, erro ao obter usuário autenticado."
		}
	}

	const user = getCurrentAuthSessionServiceRes.data.session.user

	// 2) Checar se o user possui membership de alguam org
	const getOrganizationMembershipByUserIdServiceRes = await getOrganizationMembershipByUserIdService({ userId: user.id })
	if (getOrganizationMembershipByUserIdServiceRes.success === false) {
		return {
			success: false,
			message: "Não foi possível gerar link de convite, erro ao verificar se o usuário pertence a uma organização."
		}
	}

	// 3) Verificar se o user tem permissão(OWNER/ADMIN) para gerar o link de convite
	const userRole = getOrganizationMembershipByUserIdServiceRes.data.organizationMemberships.role
	if (userRole !== "OWNER" && userRole !== "ADMIN") {
		return {
			success: false,
			message: "Você não tem permissão para gerar links de convite."
		}
	}

	// 4) Verificar se a organization existe
	const organizationId = getOrganizationMembershipByUserIdServiceRes.data.organizationMemberships.organization_id
	const getOrganizationByIdServiceRes = await getOrganizationByIdService({ organizationId })
	if (getOrganizationByIdServiceRes.success === false) {
		return {
			success: false,
			message: "Erro ao procurar organização."
		}
	}

	const organization = getOrganizationByIdServiceRes.data.organization

	// 5) Retornar o link de convite
	const userId = user.id
	const organizationSlug = organization.slug
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
	const inviteUrl = `${baseUrl}/${organizationSlug}/invite/${userId}`

	return {
		success: true,
		message: "Link de convite gerado com sucesso.",
		data: {
			inviteLink: inviteUrl
		}
	}
}
