"use server"

import type { PermissionKey } from "@/modules/auth/shared/permissions"
import { getOrganizationRolesContextUseCase } from "@/modules/organizations/memberships/server/slices/get-organization-roles-context/use-cases/get-organization-roles-context.use-case"
import type { OrganizationDTO } from "@/modules/organizations/shared/types/dto"
import { getPublicAssetUrl } from "@/shared/storage/get-public-asset-url"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RolePermission = {
	id: string
	key: string
	description: string
}

type OrganizationRoleWithPermissions = {
	id: string
	name: string
	isActive: boolean
	isSystem: boolean
	permissions: RolePermission[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

type GetOrganizationRolesContextActionRes = {
	organization: OrganizationDTO
	roles: OrganizationRoleWithPermissions[]
	permissionsKeys: PermissionKey[]
}

export async function getOrganizationRolesContextAction(): OperationResponse<GetOrganizationRolesContextActionRes, ErrorCodes> {
	const useCaseRes = await getOrganizationRolesContextUseCase()

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	const { organization } = useCaseRes.data
	let imageUrl: string | null = null

	try {
		if (organization.image_path) {
			imageUrl = await getPublicAssetUrl({ path: organization.image_path })
		}
	} catch (error) {
		console.log(`[getOrganizationRolesContextAction]: ${error}`)
	}

	return {
		success: true,
		message: useCaseRes.message,
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
			},
			roles: useCaseRes.data.roles.map((role) => ({
				id: role.id,
				name: role.name,
				isActive: role.is_active,
				isSystem: role.is_system,
				permissions: role.permissions
			})),
			permissionsKeys: useCaseRes.data.permissionsKeys
		}
	}
}
