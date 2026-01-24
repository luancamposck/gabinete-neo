// @/modules/organizations/referrals/server/services/create-referral.service.ts

import { insertOrganizationReferralAdminRepo } from "@/modules/organizations/referrals/server/repos/insert-referral.admin.repo"
import type { OrganizationReferralInsert } from "@/modules/organizations/referrals/shared/types/db"
import type { CreateOrganizationReferralParams } from "@/modules/organizations/referrals/shared/types/inputs"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_CREATE_REFERRAL_ERROR = "Não foi possível registrar a indicação. Tente novamente mais tarde."

const CREATE_REFERRAL_SUCCESS = "Indicação registrada com sucesso."
const prefixLog = "[createOrganizationReferralService]:"

export async function createOrganizationReferralService(params: CreateOrganizationReferralParams): OperationResponse<{ referralId: string }> {
	try {
		const insertParams: OrganizationReferralInsert = {
			organization_id: params.organizationId,
			inviter_user_id: params.inviterUserId,
			invited_user_id: params.invitedUserId,
			relationship_to_inviter: params.relationshipToInviter ?? null
		}

		const { data, error } = await insertOrganizationReferralAdminRepo(insertParams)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_CREATE_REFERRAL_ERROR
			}
		}

		const referralId = data.id

		return {
			success: true,
			message: CREATE_REFERRAL_SUCCESS,
			data: {
				referralId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_CREATE_REFERRAL_ERROR
		}
	}
}
