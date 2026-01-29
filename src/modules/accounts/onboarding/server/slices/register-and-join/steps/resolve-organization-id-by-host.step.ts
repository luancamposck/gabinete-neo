// @/modules/accounts/onboarding/server/slices/register-and-join/steps/resolve-organization-id-by-host.step.ts

import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type ResolveOrganizationIdByHostStepRes = {
	host: string
	organizationId: string
}

const prefixLog = "[resolveOrganizationIdByHostStep]:"

export async function resolveOrganizationIdByHostStep(): OperationResponse<ResolveOrganizationIdByHostStepRes> {
	// ------------------------------------------------------------
	// 0) Resolver organizationId via host (app_domain)
	// ------------------------------------------------------------
	const host = await getRequestHost()

	if (!host) {
		console.error(`${prefixLog} missing request host`)
		return {
			success: false,
			message: "Não foi possível identificar o domínio da requisição."
		}
	}

	const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
	if (orgRes.success === false) return orgRes

	return {
		success: true,
		message: "Organização resolvida com sucesso.",
		data: {
			host,
			organizationId: orgRes.data.organizationId
		}
	}
}
