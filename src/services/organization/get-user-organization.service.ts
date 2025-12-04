// src/services/get-user-organization.service.ts

import { getCurrentAuthUserRepo } from "@/repositories/auth-users/auth-users.repo"
import { findOrganizationMembershipByUserAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import { findOrganizationByIdRepo } from "@/repositories/organizations/organizations.repo"
import type { OperationResponse } from "@/types/operation-response"

export interface GetUserOrganizationServiceData {
	organizationId: string
	organizationSlug: string
	organizationName: string
}

export default async function getUserOrganizationService(): Promise<OperationResponse<GetUserOrganizationServiceData>> {
	// 1) Usuário autenticado
	const { data: authData, error: authError } = await getCurrentAuthUserRepo()

	if (authError || !authData?.user) {
		console.error("[getUserOrganizationService] Usuário não autenticado:", authError?.message)

		return {
			success: false,
			message: "Você precisa estar autenticado para acessar a organização."
		}
	}

	const userId = authData.user.id

	// 2) Membership do usuário (1 user = 1 org)
	const { data: membership, error: membershipError } = await findOrganizationMembershipByUserAdminRepo({ userId })

	if (membershipError || !membership) {
		console.error("[getUserOrganizationService] Membership não encontrado para user:", userId, membershipError)

		return {
			success: false,
			message: "Nenhuma organização encontrada para este usuário."
		}
	}

	const organizationId = membership.organization_id

	// 3) Buscar dados da organização (pra pegar slug, name, etc.)
	const { data: organization, error: organizationError } = await findOrganizationByIdRepo(organizationId)

	if (organizationError || !organization) {
		console.error("[getUserOrganizationService] Organização não encontrada para id:", organizationId, organizationError)

		return {
			success: false,
			message: "Organização não encontrada."
		}
	}

	return {
		success: true,
		message: "Organização carregada com sucesso.",
		data: {
			organizationId: organization.id,
			organizationSlug: organization.slug, // 👈 daqui vem o slug
			organizationName: organization.name
		}
	}
}
