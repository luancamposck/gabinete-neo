// @/modules/organizations/memberships/server/services/update-membership-by-org-and-user-id.service.ts

import { updateMembershipByOrgAndUserIdAdminRepo } from "@/modules/organizations/memberships/server/repos/update-membership-by-org-and-user-id.admin.repo"
import type { MembershipUpdate } from "@/modules/organizations/memberships/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export type MembershipPatch = {
	roleId?: string
	isActive?: boolean
}

type UpdateMembershipByOrgAndUserIdServiceParams = {
	organizationId: string
	userId: string
	patch: MembershipPatch
}

type ErrorCodes = "membership_not_found" | "invalid_patch" | "infra_error"

const GENERIC_ERROR = "Não foi possível atualizar o membership. Tente novamente mais tarde."
const INVALID_PATCH_ERROR = "Nenhum campo válido foi informado para atualização."
const NOT_FOUND_ERROR = "Membro não encontrado nesta organização."
const SUCCESS_MESSAGE = "Membership atualizado com sucesso."
const prefixLog = "[updateMembershipByOrgAndUserIdService]:"

function toDbPatch(patch: MembershipPatch): MembershipUpdate {
	const payload: MembershipUpdate = {}

	if (patch.roleId !== undefined) {
		payload.role_id = patch.roleId
	}

	if (patch.isActive !== undefined) {
		payload.is_active = patch.isActive
	}

	return payload
}

export async function updateMembershipByOrgAndUserIdService(params: UpdateMembershipByOrgAndUserIdServiceParams): OperationResponse<{ organizationId: string; userId: string }, ErrorCodes> {
	const dbPatch = toDbPatch(params.patch)
	if (Object.keys(dbPatch).length === 0) {
		return {
			success: false,
			message: INVALID_PATCH_ERROR,
			code: "invalid_patch"
		}
	}

	try {
		const { data, error } = await updateMembershipByOrgAndUserIdAdminRepo({
			organizationId: params.organizationId,
			userId: params.userId,
			patch: dbPatch
		})

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		if (!data?.organization_id || !data?.user_id) {
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
				organizationId: data.organization_id,
				userId: data.user_id
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
