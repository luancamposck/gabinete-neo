import { listReferralsWithInviterByOrganizationIdAdminRepo, type OrganizationReferralWithInviterName } from "@/modules/organizations/referrals/server/repos/list-referrals-with-inviter-by-organization-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível obter os convites por indicação da organização. Tente novamente mais tarde."
const OK_MESSAGE = "Convites por indicação obtidos com sucesso."
const prefixLog = "[listReferralsWithInviterByOrganizationIdService]:"

export async function listReferralsWithInviterByOrganizationIdService(params: { organizationId: string }): OperationResponse<{ organizationReferrals: OrganizationReferralWithInviterName[] }> {
	try {
		const { data, error } = await listReferralsWithInviterByOrganizationIdAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR
			}
		}

		return {
			success: true,
			message: OK_MESSAGE,
			data: {
				organizationReferrals: data ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR
		}
	}
}
