// @/modules/organizations/server/slices/delete-organization-og-image/use-cases/delete-organization-og-image.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { deleteOrganizationOgImageService } from "@/modules/organizations/server/services/delete-organization-og-image.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getOrganizationImagePathService } from "@/modules/organizations/server/services/get-organization-image-path.service"
import { updateOrganizationService } from "@/modules/organizations/server/services/update-organization.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type DeleteOrganizationOgImageUseCaseRes = {
	deleted: boolean
}

type DeleteOrganizationOgImageCode = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

const prefixLog = "[deleteOrganizationOgImageUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_ALLOWED = "Você não tem permissão para atualizar esta organização."
const MSG_INFRA_ERROR = "Não foi possível remover a imagem. Tente novamente em instantes."
const MSG_NO_IMAGE = "Não há imagem para remover."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function deleteOrganizationOgImageUseCase(): OperationResponse<DeleteOrganizationOgImageUseCaseRes, DeleteOrganizationOgImageCode> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
		//
		// Possibilidades:
		// - sem user => unauthenticated (layout redireciona pro login)
		// - erro técnico => infra_error (layout pode cair no error boundary)
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

		const userId = authRes.data.user.id

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
		// 3) Verificar permissão do usuário na org atual
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - não tem permissão => not_allowed
		// - tem permissão => ok
		// ============================================================
		const permissionRes = await hasMembershipPermissionService({
			organizationId,
			userId,
			permissionKey: "org.admin.update"
		})

		if (permissionRes.success === false) {
			console.error(`${prefixLog} permission check failed:`, permissionRes.message)
			return FALLBACK_INFRA_ERROR
		}

		if (permissionRes.data.allowed === false) {
			return {
				success: false,
				code: "not_allowed",
				message: MSG_NOT_ALLOWED
			}
		}

		// ============================================================
		// 4) Obter o path atual da imagem
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// ============================================================
		const imagePathRes = await getOrganizationImagePathService({ organizationId })
		if (imagePathRes.success === false) {
			if (imagePathRes.code === "org_not_found") {
				return {
					success: false,
					code: "org_not_found",
					message: MSG_ORG_NOT_FOUND
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const { imagePath } = imagePathRes.data

		if (!imagePath) {
			return {
				success: true,
				message: MSG_NO_IMAGE,
				data: {
					deleted: false
				}
			}
		}

		// ============================================================
		// 5) Deletar a imagem
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// ============================================================
		const deleteRes = await deleteOrganizationOgImageService({ imagePath })
		if (deleteRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 6) Atualizar o path da image
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// ============================================================
		const updatePathRes = await updateOrganizationService({
			organizationId,
			updates: {
				image_path: null
			}
		})

		if (updatePathRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: deleteRes.message,
			data: {
				deleted: true
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}
