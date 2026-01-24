// @/modules/organizations/memberships/server/services/is-user-member-of-organization.service.ts

import { findMembershipByOrgAndUserAdminRepo } from "@/modules/organizations/memberships/server/repos/find-membership-by-org-id-and-user-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type IsUserMemberOfOrganizationParams = {
	organizationId: string
	userId: string
}

type IsUserMemberOfOrganizationRes = {
	isMember: boolean
	isActive: boolean
	role?: "OWNER" | "ADMIN" | "MEMBER"
}

const prefixLog = "[isUserMemberOfOrganizationService]:"
const GENERIC_ERROR = "Não foi possível verificar a participação do usuário. Tente novamente mais tarde."
const OK_MESSAGE = "Participação verificada com sucesso."

export async function isUserMemberOfOrganizationService(params: IsUserMemberOfOrganizationParams): OperationResponse<IsUserMemberOfOrganizationRes> {
	try {
		const { data, error } = await findMembershipByOrgAndUserAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR
			}
		}

		// Não existe membership
		if (!data) {
			return {
				success: true,
				message: OK_MESSAGE,
				data: {
					isMember: false,
					isActive: false
				}
			}
		}

		// Existe, mas pode estar inativo
		const isActive = data.is_active === true

		return {
			success: true,
			message: OK_MESSAGE,
			data: {
				isMember: isActive,
				isActive,
				role: data.role as "OWNER" | "ADMIN" | "MEMBER"
			}
		}
	} catch (err) {
		console.error(`${prefixLog} unexpected error:`, err)
		return {
			success: false,
			message: GENERIC_ERROR
		}
	}
}
