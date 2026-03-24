// @/modules/organizations/insights/people-map/server/slices/get-map-pins/use-cases/get-map-pins.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { listCityPinsForMapService } from "@/modules/organizations/insights/people-map/server/services/list-city-pins-for-map.service"
import type { CityPin } from "@/modules/organizations/insights/people-map/shared/types/pins"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetMapPinsUseCaseRes = {
	pins: CityPin[]
	totalMembers: number
	mappedMembers: number
	unmappedMembers: { id: string; name: string }[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "infra_error"

const prefixLog = "[getMapPinsUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_INFRA_ERROR = "Não foi possível carregar o mapa. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getMapPinsUseCase(): OperationResponse<GetMapPinsUseCaseRes, ErrorCodes> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
		//
		// Possibilidades:
		// - sem user => unauthenticated
		// - erro técnico => infra_error
		// ============================================================
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false) {
			if (authRes.code === "unauthenticated") {
				return {
					success: false,
					code: "unauthenticated",
					message: MSG_UNAUTHENTICATED
				}
			}

			if (authRes.code === "infra_error") {
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 1) Resolver host (tenant atual via app_domain)
		//
		// Possibilidades:
		// - host ausente => org_not_found (não tem como resolver tenant)
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		// ============================================================
		// 2) Resolver organizationId (tenant atual via app_domain)
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// ============================================================
		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
		if (orgRes.success === false) {
			if (orgRes.code === "org_not_found") {
				return {
					success: false,
					code: "org_not_found",
					message: MSG_ORG_NOT_FOUND
				}
			}

			if (orgRes.code === "infra_error") {
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const organizationId = orgRes.data.organizationId

		// ============================================================
		// 3) Carregar pins do mapa via service
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - ok => pins, totalMembers, mappedMembers, unmappedMembers
		// ============================================================
		const pinsRes = await listCityPinsForMapService({ organizationId })
		if (pinsRes.success === false) {
			console.error(`${prefixLog} pins load failed:`, pinsRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: dados prontos para o mapa
		// ============================================================
		return {
			success: true,
			message: pinsRes.message,
			data: pinsRes.data
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}
