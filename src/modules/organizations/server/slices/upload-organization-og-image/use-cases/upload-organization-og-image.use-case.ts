// @/modules/organizations/server/slices/upload-organization-og-image/use-cases/upload-organization-og-image.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { uploadOrganizationOgImageService } from "@/modules/organizations/server/services/upload-organization-og-image.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"
import { deleteOrganizationOgImageService } from "../../../services/delete-organization-og-image.service"
import { getOrganizationImagePathService } from "../../../services/get-organization-image-path.service"
import { updateOrganizationService } from "../../../services/update-organization.service"

type UploadOrganizationOgImageUseCaseRes = {
	path: string
}

type UploadOrganizationOgImageCode = "unauthenticated" | "org_not_found" | "not_allowed" | "invalid_file" | "infra_error"

type Params = {
	file: File
}

const prefixLog = "[uploadOrganizationOgImageUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_ALLOWED = "Você não tem permissão para atualizar esta organização."
const MSG_INFRA_ERROR = "Não foi possível enviar a imagem. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function uploadOrganizationOgImageUseCase(params: Params): OperationResponse<UploadOrganizationOgImageUseCaseRes, UploadOrganizationOgImageCode> {
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
		const orgRes = await getOrganizationIdByAppDomainAction({ appDomain: host })
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

		const oldPathRes = await getOrganizationImagePathService({ organizationId })
		if (oldPathRes.success === false) {
			return oldPathRes
		}

		const { imagePath: oldPath } = oldPathRes.data

		// ============================================================
		// 4) Fazer upload da imagem para o bucket público
		//
		// Possibilidades:
		// - arquivo inválido => invalid_file
		// - erro técnico => infra_error
		// ============================================================
		const uploadRes = await uploadOrganizationOgImageService({
			organizationId,
			file: params.file
		})

		if (uploadRes.success === false) {
			if (uploadRes.code === "invalid_file") {
				return {
					success: false,
					code: "invalid_file",
					message: uploadRes.message
				}
			}

			if (uploadRes.code === "infra_error") {
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const { path } = uploadRes.data

		// ============================================================
		// 5) Atualizar o path da image
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// ============================================================
		const updatePathRes = await updateOrganizationService({
			organizationId,
			updates: {
				image_path: path
			}
		})

		if (updatePathRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 6) Deleta Image antiga
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// ============================================================
		if (oldPath) {
			await deleteOrganizationOgImageService({ imagePath: oldPath })
		}

		// ============================================================
		// OK: upload realizado
		// ============================================================
		return {
			success: true,
			message: uploadRes.message,
			data: {
				path: uploadRes.data.path
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}
