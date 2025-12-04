import "server-only"

import { insertOrganizationsAdminRepo, type OrganizationsInsert } from "@/repositories/organizations/organizations.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

export interface CreateOrganizationServiceParams extends OrganizationsInsert {}

export default async function createOrganizationService(params: CreateOrganizationServiceParams): Promise<OperationResponse<{ organizationId: string }>> {
	const { data: organizationResData, error: organizationResError } = await insertOrganizationsAdminRepo(params)

	if (organizationResError || !organizationResData) {
		console.error(`[createOrganizationService]: ${organizationResError.message}`)

		let errorMessage = "Não foi possível criar a organização."

		if (organizationResError?.code === "23505") {
			errorMessage = "Organização já cadastrado no sistema."
		}

		return {
			success: false,
			message: errorMessage
		}
	}

	const organizationId = organizationResData.id

	return {
		success: true,
		message: "Organização criada com sucesso.",
		data: {
			organizationId: organizationId
		}
	}
}
