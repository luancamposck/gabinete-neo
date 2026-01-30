"use server"

import { getOrganizationIdByAppDomainService } from "../../../services/get-organization-id-by-app-domain.service"

export async function getOrganizationIdByAppDomainAction({ appDomain }: { appDomain: string }) {
	return getOrganizationIdByAppDomainService({ appDomain })
}
