import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { listPublicSurveysService } from "@/modules/surveys/server/services/list-public-surveys.service"
import type { SurveyPublicListItemDTO } from "@/modules/surveys/shared/types/dto"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ListPublicSurveysUseCaseRes = {
	surveys: SurveyPublicListItemDTO[]
}

type ListPublicSurveysUseCaseCode = "org_not_found" | "infra_error"

const prefixLog = "[listPublicSurveysUseCase]:"

const MSG_SUCCESS = "Pesquisas públicas listadas com sucesso."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_INFRA_ERROR = "Não foi possível listar as pesquisas públicas. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function listPublicSurveysUseCase(): OperationResponse<ListPublicSurveysUseCaseRes, ListPublicSurveysUseCaseCode> {
	try {
		// ============================================================
		// 0) Resolver host atual
		//
		// Possibilidades:
		// - host ausente => org_not_found
		// - host presente => seguir fluxo
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				message: MSG_ORG_NOT_FOUND,
				code: "org_not_found"
			}
		}

		// ============================================================
		// 1) Resolver organização pelo app_domain
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// - org encontrada => seguir listagem
		// ============================================================
		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
		if (orgRes.success === false) {
			if (orgRes.code === "org_not_found") {
				return {
					success: false,
					message: MSG_ORG_NOT_FOUND,
					code: "org_not_found"
				}
			}

			if (orgRes.code === "infra_error") {
				return FALLBACK_INFRA_ERROR
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 2) Listar surveys públicas publicadas da organização
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => retornar surveys
		// ============================================================
		const surveysRes = await listPublicSurveysService({ organizationId: orgRes.data.organizationId })
		if (surveysRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				surveys: surveysRes.data.surveys
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}
