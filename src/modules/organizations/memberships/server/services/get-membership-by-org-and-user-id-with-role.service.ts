// @/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service.ts

import { getMembershipByOrgAndUserIdWithRoleAdminRepo } from "@/modules/organizations/memberships/server/repos/get-membership-by-org-and-user-id-with-role.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetMembershipByOrgAndUserIdWithRoleServiceParams = {
	organizationId: string
	userId: string
}

type ErrorCodes = "membership_not_found" | "infra_error"

const GENERIC_ERROR = "Não foi possível obter o membership do membro. Tente novamente mais tarde."
const NOT_FOUND_ERROR = "Membro não encontrado nesta organização."
const SUCCESS_MESSAGE = "Membership obtido com sucesso."
const prefixLog = "[getMembershipByOrgAndUserIdWithRoleService]:"

export async function getMembershipByOrgAndUserIdWithRoleService(params: GetMembershipByOrgAndUserIdWithRoleServiceParams): OperationResponse<{ isActive: boolean; roleName: string }, ErrorCodes> {
	try {
		const { data, error } = await getMembershipByOrgAndUserIdWithRoleAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		const roleName = data?.role?.name
		if (!data || !roleName) {
			return {
				success: false,
				message: NOT_FOUND_ERROR,
				code: "membership_not_found"
			}
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: {
				isActive: data.is_active === true,
				roleName
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR,
			code: "infra_error"
		}
	}
}
