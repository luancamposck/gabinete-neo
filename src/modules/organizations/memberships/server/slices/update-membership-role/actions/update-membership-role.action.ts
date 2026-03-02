// @/modules/organizations/memberships/server/slices/update-membership-role/actions/update-membership-role.action.ts
"use server"

import { revalidatePath } from "next/cache"

import { updateMembershipRoleUseCase } from "@/modules/organizations/memberships/server/slices/update-membership-role/use-cases/update-membership-role.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type UpdateMembershipRoleActionParams = {
	memberUserId: string
	roleId: string
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "invalid_role" | "membership_not_found" | "infra_error"

export async function updateMembershipRoleAction(params: UpdateMembershipRoleActionParams): OperationResponse<{ memberUserId: string; roleId: string }, ErrorCodes> {
	const useCaseRes = await updateMembershipRoleUseCase(params)

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	revalidatePath("/dashboard/network/my-network")

	return useCaseRes
}
