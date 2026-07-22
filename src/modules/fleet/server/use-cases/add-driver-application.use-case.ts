// @/modules/fleet/server/use-cases/add-driver-application.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { AddDriverApplicationUseCaseCodes, AddDriverApplicationUseCaseData, AddDriverApplicationUseCaseParams } from "../../shared/types/slices/add-driver-application.types"
import { checkPendingDriverApplicationService } from "../services/check-pending-driver-application.service"
import { checkPlateAvailableService } from "../services/check-plate-available.service"
import { createDriverApplicationService } from "../services/create-driver-application.service"
import { deleteDriverDocumentsService } from "../services/delete-driver-documents.service"
import { uploadDriverDocumentService } from "../services/upload-driver-document.service"

const prefixLog = "[addDriverApplicationUseCase]:"

export async function addDriverApplicationUseCase(params: AddDriverApplicationUseCaseParams): AppResultAsync<AddDriverApplicationUseCaseData, AddDriverApplicationUseCaseCodes> {
	// ============================================================
	// 1) Autenticar quem está adicionando o motorista
	// ============================================================
	const currentUserRes = await getCurrentAuthUserService()

	if (currentUserRes.success === false) {
		return {
			success: false,
			code: currentUserRes.code === "unauthenticated" ? "unauthenticated" : "generic_error"
		}
	}

	const adminUserId = currentUserRes.data.user.id

	// ============================================================
	// 2) Resolver a organização pelo domínio atual (app_domain)
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
			code: orgRes.code === "infra_error" ? "generic_error" : "org_not_found"
		}
	}

	const organizationId = orgRes.data.organizationId

	// ============================================================
	// 3) Guard de permissão: quem chama precisa gerenciar candidaturas
	// ============================================================
	const permissionRes = await hasMembershipPermissionService({
		organizationId,
		userId: adminUserId,
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
	// 4) O candidato selecionado precisa já ser membro ativo da org
	//
	// Esta tela só transforma uma conta existente em motorista — não
	// cria conta nem membership. Isso fica pra um convite, planejado
	// separadamente.
	// ============================================================
	const candidateMembershipRes = await isUserMemberOfOrganizationService({
		organizationId,
		userId: params.candidateUserId
	})

	if (candidateMembershipRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	if (candidateMembershipRes.data.isMember === false) {
		return {
			success: false,
			code: "candidate_not_member"
		}
	}

	// ============================================================
	// 5) Pré-checks de disponibilidade
	//
	// Antes do insert: placa não pode estar em uso por outra
	// candidatura ativa, e o candidato não pode já ter uma pending.
	// ============================================================
	const plateRes = await checkPlateAvailableService({
		organizationId,
		plate: params.plate
	})
	if (plateRes.success === false) return plateRes

	const pendingRes = await checkPendingDriverApplicationService({
		organizationId,
		userId: params.candidateUserId
	})
	if (pendingRes.success === false) return pendingRes

	// ============================================================
	// 6) Upload dos documentos (CRLV e CNH)
	//
	// Possibilidades:
	// - Falha no upload do CRLV: nada foi enviado ainda, retorna direto.
	// - Falha no upload da CNH: desfaz o CRLV já enviado antes de retornar.
	// - Sucesso: seguimos com os dois paths pro create.
	// ============================================================
	const crlvUploadRes = await uploadDriverDocumentService({
		organizationId,
		userId: params.candidateUserId,
		file: params.crlv
	})
	if (crlvUploadRes.success === false) return crlvUploadRes

	const cnhUploadRes = await uploadDriverDocumentService({
		organizationId,
		userId: params.candidateUserId,
		file: params.cnh
	})
	if (cnhUploadRes.success === false) {
		const cleanupRes = await deleteDriverDocumentsService({ paths: [crlvUploadRes.data.path] })
		if (cleanupRes.success === false) {
			console.error(`${prefixLog} failed to cleanup CRLV after CNH upload failure: ${cleanupRes.message}`)
		}
		return cnhUploadRes
	}

	// ============================================================
	// 7) Criar a candidatura (sempre pending — aprovar é outro fluxo)
	//
	// Possibilidades:
	// - Falha no create: os dois documentos já enviados ficariam órfãos,
	//   desfazemos ambos antes de propagar o erro.
	// - Sucesso: retorna o id da candidatura criada.
	// ============================================================
	const createRes = await createDriverApplicationService({
		organizationId,
		userId: params.candidateUserId,
		plate: params.plate,
		vehicleType: params.vehicleType,
		vehicleModel: params.vehicleModel,
		vehicleYear: params.vehicleYear,
		vehicleColor: params.vehicleColor,
		crlvDocumentPath: crlvUploadRes.data.path,
		cnhDocumentPath: cnhUploadRes.data.path
	})
	if (createRes.success === false) {
		const cleanupRes = await deleteDriverDocumentsService({ paths: [crlvUploadRes.data.path, cnhUploadRes.data.path] })
		if (cleanupRes.success === false) {
			console.error(`${prefixLog} failed to cleanup documents after create failure: ${cleanupRes.message}`)
		}
		return createRes
	}

	return {
		success: true,
		data: {
			applicationId: createRes.data.applicationId
		}
	}
}
