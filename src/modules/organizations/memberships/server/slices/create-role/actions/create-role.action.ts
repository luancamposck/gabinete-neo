"use server"

import { revalidatePath } from "next/cache"
import { createRoleUseCase } from "@/modules/organizations/memberships/server/slices/create-role/use-cases/create-role.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CreateRoleActionParams = {
	name: string
	permissionKeys: string[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "invalid_role_name" | "role_name_conflict" | "invalid_permissions" | "infra_error"

export async function createRoleAction(params: CreateRoleActionParams): OperationResponse<{ roleId: string; roleName: string; grantedPermissionsCount: number }, ErrorCodes> {
	const useCaseRes = await createRoleUseCase(params)

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	revalidatePath("/dashboard/config/roles")

	return useCaseRes
}
