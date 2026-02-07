// @/modules/organizations/memberships/server/slices/join-current-organization/use-cases/join-current-organization.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { createOrganizationMembershipService } from "@/modules/organizations/memberships/server/services/create-membership.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"
import { getRoleByNameService } from "../../../services/get-role-by-name.service"

type JoinCurrentOrganizationUseCaseRes = {
	host: string
	organizationId: string
	userId: string
	userEmail: string
	alreadyMember: boolean
	joined: boolean
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "infra_error"

const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para acessar a página."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_INFRA_ERROR = "Não foi possível validar seu acesso. Tente novamente em instantes."
const prefixLog = "[joinCurrentOrganizationUseCase]:"

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function joinCurrentOrganizationUseCase(): OperationResponse<JoinCurrentOrganizationUseCaseRes, ErrorCodes> {
	try {
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

		const currentUserRes = await getCurrentAuthUserService()
		if (currentUserRes.success === false) {
			if (currentUserRes.code === "unauthenticated") {
				return {
					success: false,
					code: "unauthenticated",
					message: MSG_UNAUTHENTICATED
				}
			}

			if (currentUserRes.code === "infra_error") {
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const userId = currentUserRes.data.user.id
		const userEmail = currentUserRes.data.user.email ?? ""

		const membershipRes = await isUserMemberOfOrganizationService({
			organizationId,
			userId
		})
		if (membershipRes.success === false) return FALLBACK_INFRA_ERROR

		if (membershipRes.data.isMember === true) {
			return {
				success: true,
				message: "Você já pertence a esta organização.",
				data: {
					host,
					organizationId,
					userId,
					userEmail,
					alreadyMember: true,
					joined: false
				}
			}
		}

		const getRoleRes = await getRoleByNameService({
			name: "MEMBER",
			organizationId
		})

		if (getRoleRes.success === false) {
			if (getRoleRes.code === "role_not_found") {
				console.warn(`${prefixLog} role MEMBER not found for organizationId: ${organizationId}`)
			}

			return FALLBACK_INFRA_ERROR
		}

		const roleId = getRoleRes.data.role.id

		const createMembershipRes = await createOrganizationMembershipService({ organizationId, userId, roleId })

		if (createMembershipRes.success === false) FALLBACK_INFRA_ERROR

		return {
			success: true,
			message: "Você entrou na organização com sucesso.",
			data: {
				host,
				organizationId,
				userId,
				userEmail,
				alreadyMember: false,
				joined: true
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}
