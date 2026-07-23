import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { listFleetDriversByOrganizationIdService } from "@/modules/fleet/server/services/list-fleet-drivers-by-organization-id.service"
import type { GetFleetDriversForTableUseCaseCodes, GetFleetDriversForTableUseCaseData } from "@/modules/fleet/shared/types/flows/get-fleet-drivers-for-table.types"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { AppResultAsync } from "@/shared/types/app-result.types"

const prefixLog = "[getFleetDriversForTableUseCase]:"

export async function getFleetDriversForTableUseCase(): AppResultAsync<GetFleetDriversForTableUseCaseData, GetFleetDriversForTableUseCaseCodes> {
	// ============================================================
	// 1) Autenticar quem está acessando a tabela de motoristas
	//
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
	//
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
	// 3) Exigir permissão para acessar a gestão da frota
	//
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
	// 4) Listar motoristas da organização autorizada
	//
	// Possibilidades:
	// - Falha técnica: "generic_error".
	// - Sucesso: lista completa, incluindo ativos e inativos.
	// ============================================================
	const listRes = await listFleetDriversByOrganizationIdService({ organizationId })

	if (listRes.success === false) {
		return listRes
	}

	// ============================================================
	// 5) Projetar o contrato público da tabela
	//
	// - reviewed_at é a data semântica de aprovação.
	// - is_active representa o status do motorista, não da membership.
	// - IDs do tenant e detalhes internos não são expostos.
	// ============================================================
	const drivers = listRes.data.drivers.map((driver) => ({
		driverId: driver.id,
		plate: driver.plate,
		vehicleType: driver.vehicle_type,
		member: driver.member,
		approvedAt: driver.origin_application.reviewed_at,
		isActive: driver.is_active
	}))

	return {
		success: true,
		data: { drivers }
	}
}
