// @/modules/organizations/server/slices/get-current-organization/actions/get-current-organization.action.ts
"use server"

import { getPublicAssetUrlService } from "@/modules/organizations/server/services/get-public-asset-url.service"
import { getOrganizationAdminSettingsUseCase } from "@/modules/organizations/server/slices/get-organization-admin-settings/use-cases/get-organization-admin-settings.use-case"
import type { OrganizationDTO } from "@/modules/organizations/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetOrganizationAdminSettingsActionRes = {
	organization: OrganizationDTO
}

type GetCurrentOrganizationCode = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

export async function getOrganizationAdminSettingsAction(): OperationResponse<GetOrganizationAdminSettingsActionRes, GetCurrentOrganizationCode> {
	const res = await getOrganizationAdminSettingsUseCase()

	if (res.success === false) return res

	const { organization } = res.data
	let imageUrl: string | null = null

	try {
		if (organization.image_path) {
			imageUrl = await getPublicAssetUrlService({ path: organization.image_path })
		}
	} catch (error) {
		console.log(`[getOrganizationAdminSettingsAction]: ${error}`)
	}

	return {
		success: true,
		message: res.message,
		data: {
			organization: {
				id: organization.id,
				name: organization.name,
				description: organization.description,
				appDomain: organization.app_domain,
				imageUrl,
				isActive: organization.is_active,
				createdAt: organization.created_at,
				updatedAt: organization.updated_at
			}
		}
	}
}
