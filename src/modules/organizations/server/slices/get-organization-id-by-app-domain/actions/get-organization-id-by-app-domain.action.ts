// @/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action.ts
"use server"

import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"

export async function getOrganizationIdByAppDomainAction({ appDomain }: { appDomain: string }) {
	return getOrganizationIdByAppDomainService({ appDomain })
}
