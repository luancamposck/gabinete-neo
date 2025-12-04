// src/actions/get-user-organization.action.ts
"use server"

import { getUserOrganizationService } from "@/services/organization/get-user-organization.service"
import type { OperationResponse } from "@/types/operation-response"

export async function getUserOrganizationAction(): Promise<OperationResponse<{ organizationId: string }>> {
	const serviceRes = await getUserOrganizationService()

	if (!serviceRes.success || !serviceRes.data) {
		return {
			success: false,
			message: serviceRes.message
		}
	}

	return {
		success: true,
		message: serviceRes.message,
		data: {
			organizationId: serviceRes.data.organizationId
		}
	}
}
