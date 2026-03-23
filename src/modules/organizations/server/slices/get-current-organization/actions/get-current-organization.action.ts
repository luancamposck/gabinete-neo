// @/modules/organizations/server/slices/get-current-organization/actions/get-current-organization.action.ts
"use server"

import { getCurrentOrganizationUseCase } from "@/modules/organizations/server/slices/get-current-organization/use-cases/get-current-organization.use-case"
import type { OrganizationDTO } from "@/modules/organizations/shared/types/dto"
import { getPublicAssetUrlService } from "@/modules/organizations/server/services/get-public-asset-url.service"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetCurrentOrganizationActionRes = {
	organization: OrganizationDTO
}

type GetCurrentOrganizationCode = "org_not_found" | "infra_error"

export async function getCurrentOrganizationAction(): OperationResponse<GetCurrentOrganizationActionRes, GetCurrentOrganizationCode> {
	const res = await getCurrentOrganizationUseCase()

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
				slug: organization.slug,
				description: organization.description,
				appDomain: organization.app_domain,
				imageUrl,
				isActive: organization.is_active,
				createdAt: organization.created_at,
				updatedAt: organization.updated_at,
				createdByUserId: organization.created_by_user_id
			}
		}
	}
}
