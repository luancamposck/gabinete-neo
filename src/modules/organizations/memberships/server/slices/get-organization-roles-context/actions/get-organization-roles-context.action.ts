"use server"

import type { PermissionKey } from "@/modules/auth/shared/permissions"
import { getOrganizationRolesContextUseCase } from "@/modules/organizations/memberships/server/slices/get-organization-roles-context/use-cases/get-organization-roles-context.use-case"
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
	organization: {
		name: string
	}
	roles: OrganizationRoleWithPermissions[]
	permissionsKeys: PermissionKey[]
	availablePermissions: RolePermission[]
}

export async function getOrganizationRolesContextAction(): OperationResponse<GetOrganizationRolesContextActionRes, ErrorCodes> {
	const useCaseRes = await getOrganizationRolesContextUseCase()

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	const { organization } = useCaseRes.data

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			organization: {
				name: organization.name
			},
			roles: useCaseRes.data.roles.map((role) => ({
				id: role.id,
				name: role.name,
				isActive: role.is_active,
				isSystem: role.is_system,
				permissions: role.permissions
			})),
			permissionsKeys: useCaseRes.data.permissionsKeys,
			availablePermissions: useCaseRes.data.availablePermissions
		}
	}
}
