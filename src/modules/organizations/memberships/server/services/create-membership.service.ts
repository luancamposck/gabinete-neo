// @/modules/organizations/memberships/server/services/create-membership.service.ts

import { insertOrganizationMembershipAdminRepo } from "@/modules/organizations/memberships/server/repos/insert-membership.admin.repo"
import type { MembershipInsert } from "@/modules/organizations/memberships/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_CREATE_MEMBERSHIP_ERROR = "Não foi possível criar o vínculo do usuário. Tente novamente mais tarde."
const CREATE_MEMBERSHIP_SUCCESS = "Vínculo criado com sucesso."
const prefixLog = "[createOrganizationMembershipService]:"

export async function createOrganizationMembershipService(params: { userId: string; organizationId: string }): OperationResponse<{ userId: string; organizationId: string }> {
	const insertMembershipParams: MembershipInsert = {
		user_id: params.userId,
		organization_id: params.organizationId,
		role: "MEMBER",
		is_active: true
	}

	try {
		const { data: insertMembershipData, error: insertMembershipError } = await insertOrganizationMembershipAdminRepo(insertMembershipParams)

		if (insertMembershipError) {
			console.error(`${prefixLog} ${insertMembershipError.message}`)
			return {
				success: false,
				message: GENERIC_CREATE_MEMBERSHIP_ERROR
			}
		}

		const userId = insertMembershipData?.user_id
		const organizationId = insertMembershipData?.organization_id

		if (!userId || !organizationId) {
			console.error(`${prefixLog} missing membership ids after insert`)
			return {
				success: false,
				message: GENERIC_CREATE_MEMBERSHIP_ERROR
			}
		}

		return {
			success: true,
			message: CREATE_MEMBERSHIP_SUCCESS,
			data: {
				userId: userId,
				organizationId: organizationId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_CREATE_MEMBERSHIP_ERROR
		}
	}
}
