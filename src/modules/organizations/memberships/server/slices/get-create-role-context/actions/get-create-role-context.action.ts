"use server"

import { getCreateRoleContextUseCase } from "@/modules/organizations/memberships/server/slices/get-create-role-context/use-cases/get-create-role-context.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type PermissionCatalogItem = {
	id: string
	key: string
	description: string
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

type GetCreateRoleContextActionRes = {
	organization: {
		name: string
	}
	availablePermissions: PermissionCatalogItem[]
}

export async function getCreateRoleContextAction(): OperationResponse<GetCreateRoleContextActionRes, ErrorCodes> {
	const useCaseRes = await getCreateRoleContextUseCase()

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			organization: {
				name: useCaseRes.data.organization.name
			},
			availablePermissions: useCaseRes.data.availablePermissions
		}
	}
}
