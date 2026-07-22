import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { GetPendingDriverApplicationsUseCaseCodes, GetPendingDriverApplicationsUseCaseData, PendingDriverApplicationDTO } from "../../shared/types/slices/get-pending-driver-applications.types"
import { createDriverDocumentSignedUrlsService } from "../services/create-driver-document-signed-urls.service"
import { listPendingDriverApplicationsService } from "../services/list-pending-driver-applications.service"

const prefixLog = "[getPendingDriverApplicationsUseCase]:"

export async function getPendingDriverApplicationsUseCase(): AppResultAsync<GetPendingDriverApplicationsUseCaseData, GetPendingDriverApplicationsUseCaseCodes> {
	// ============================================================
	// 1) Autenticar quem está acessando as candidaturas

	// Possibilidades:
	// - Sem sessão: "unauthenticated".
	// - Falha técnica no Auth: "generic_error".
	// ============================================================
	const currentUserRes = await getCurrentAuthUserService()

	if (currentUserRes.success === false) {
		return {
			success: false,
			code: currentUserRes.code === "unauthenticated" ? "unauthenticated" : "generic_error"
		}
	}

	// ============================================================
	// 2) Resolver a organização atual pelo domínio da requisição

	// Possibilidades:
	// - Host ausente ou domínio sem organização: "org_not_found".
	// - Falha técnica: "generic_error".
	// ============================================================
	const host = await getRequestHost()

	if (!host) {
		console.error(`${prefixLog} missing request host`)
		return {
			success: false,
			code: "org_not_found"
		}
	}

	const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })

	if (orgRes.success === false) {
		return {
			success: false,
			code: orgRes.code === "org_not_found" ? "org_not_found" : "generic_error"
		}
	}

	const organizationId = orgRes.data.organizationId

	// ============================================================
	// 3) Exigir permissão para gerir candidaturas de frota

	// Possibilidades:
	// - Sem a permissão: "not_allowed".
	// - Falha técnica na consulta: "generic_error".
	// ============================================================
	const permissionRes = await hasMembershipPermissionService({
		organizationId,
		userId: currentUserRes.data.user.id,
		permissionKey: PERMISSIONS.FLEET_APPLICATIONS_MANAGE
	})

	if (permissionRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	if (permissionRes.data.allowed === false) {
		return {
			success: false,
			code: "not_allowed"
		}
	}

	// ============================================================
	// 4) Listar candidaturas pending da organização autorizada

	// Possibilidades:
	// - Falha técnica: "generic_error".
	// - Sucesso: segue para assinar os documentos privados.
	// ============================================================
	const listRes = await listPendingDriverApplicationsService({ organizationId })

	if (listRes.success === false) {
		return listRes
	}

	// ============================================================
	// 5) Assinar documentos e projetar o DTO público

	// Possibilidades:
	// - Falha ao assinar um documento: URL null apenas naquele campo.
	// - Falha na chamada em lote inteira: todas as URLs ficam null.
	// - Sucesso: nunca expõe os paths privados do Storage.
	// ============================================================
	const documentPaths = listRes.data.applications.flatMap((application) => [application.crlv_document_path, application.cnh_document_path])

	const signedUrlsRes = await createDriverDocumentSignedUrlsService({ paths: documentPaths })

	if (signedUrlsRes.success === false) {
		console.error(`${prefixLog} failed to sign documents`, { organizationId, count: documentPaths.length })
	}

	const urlsByPath = signedUrlsRes.success ? signedUrlsRes.data.urlsByPath : new Map<string, string | null>()

	const applications: PendingDriverApplicationDTO[] = listRes.data.applications.map((application) => ({
		applicationId: application.id,
		candidate: application.candidate,
		plate: application.plate,
		vehicleType: application.vehicle_type,
		vehicleModel: application.vehicle_model,
		vehicleYear: application.vehicle_year,
		vehicleColor: application.vehicle_color,
		crlvSignedUrl: urlsByPath.get(application.crlv_document_path) ?? null,
		cnhSignedUrl: urlsByPath.get(application.cnh_document_path) ?? null,
		createdAt: application.created_at
	}))

	return {
		success: true,
		data: { applications }
	}
}
