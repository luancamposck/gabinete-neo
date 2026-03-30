import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { listDashboardSurveysService } from "@/modules/surveys/server/services/list-dashboard-surveys.service"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ListDashboardSurveysUseCaseRes = {
	surveys: SurveyRow[]
}

type ListDashboardSurveysUseCaseCode = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

const prefixLog = "[listDashboardSurveysUseCase]:"

const MSG_SUCCESS = "Pesquisas do dashboard listadas com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para acessar o dashboard."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_MEMBER = "Você não tem acesso a essa organização."
const MSG_INFRA_ERROR = "Não foi possível listar as pesquisas do dashboard. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function listDashboardSurveysUseCase(): OperationResponse<ListDashboardSurveysUseCaseRes, ListDashboardSurveysUseCaseCode> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
		//
		// Possibilidades:
		// - sem user => unauthenticated
		// - erro técnico => infra_error
		// - com user => seguir fluxo
		// ============================================================
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false) {
			if (authRes.code === "unauthenticated") {
				return {
					success: false,
					message: MSG_UNAUTHENTICATED,
					code: "unauthenticated"
				}
			}

			if (authRes.code === "infra_error") {
				return FALLBACK_INFRA_ERROR
			}

			return FALLBACK_INFRA_ERROR
		}

		const userId = authRes.data.user.id

		// ============================================================
		// 1) Resolver host e organização atual
		//
		// Possibilidades:
		// - host ausente => org_not_found
		// - org ausente => org_not_found
		// - erro técnico => infra_error
		// - org encontrada => seguir fluxo
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				message: MSG_ORG_NOT_FOUND,
				code: "org_not_found"
			}
		}

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

		const organizationId = orgRes.data.organizationId

		// ============================================================
		// 2) Validar membership do usuário na organização
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem membership => not_member
		// - com membership => seguir listagem
		// ============================================================
		const membershipRes = await isUserMemberOfOrganizationService({ organizationId, userId })
		if (membershipRes.success === false) {
			console.error(`${prefixLog} membership check failed:`, membershipRes.message)
			return FALLBACK_INFRA_ERROR
		}

		if (membershipRes.data.isMember === false) {
			return {
				success: false,
				message: MSG_NOT_MEMBER,
				code: "not_member"
			}
		}

		// ============================================================
		// 3) Listar surveys do dashboard (public + private)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => retornar surveys
		// ============================================================
		const surveysRes = await listDashboardSurveysService({ organizationId })
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
