"use server"

import { revalidatePath } from "next/cache"
import { updateRolePermissionsUseCase } from "@/modules/organizations/memberships/server/slices/update-role-permissions/use-cases/update-role-permissions.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type UpdateRolePermissionsActionParams = {
	roleId: string
	permissionKeys: string[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "role_not_found" | "role_not_editable" | "invalid_permissions" | "privileged_permission_not_allowed" | "infra_error"

export async function updateRolePermissionsAction(params: UpdateRolePermissionsActionParams): OperationResponse<{ roleId: string; addedCount: number; removedCount: number }, ErrorCodes> {
	const useCaseRes = await updateRolePermissionsUseCase(params)

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	revalidatePath("/dashboard/config/roles")

	return useCaseRes
}
