import "server-only"

import { insertOrganizationMenbershipsAdminRepo, type OrganizationMenbershipsInsert } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

export interface CreateOrganizationMenbershipServiceParams extends OrganizationMenbershipsInsert {}

export async function createOrganizationMenbershipService(params: CreateOrganizationMenbershipServiceParams): Promise<OperationResponse<{ organizationId: string; userId: string }>> {
	const { data: organizationMenbershipResData, error: organizationMenbershipResError } = await insertOrganizationMenbershipsAdminRepo(params)

	if (organizationMenbershipResError || !organizationMenbershipResData) {
		console.error(`[createOrganizationMenbershipService]: ${organizationMenbershipResError.message}`)

		let errorMessage = "Não foi possível criar a relação entre organização e usuário."

		if (organizationMenbershipResError?.code === "23505") {
			errorMessage = "Relação já existe no sistema."
		}

		return {
			success: false,
			message: errorMessage
		}
	}

	const newOrganizationId = organizationMenbershipResData.organization_id
	const newUserId = organizationMenbershipResData.user_id

	return {
		success: true,
		message: "Relação entre organização e usuário criada com sucesso.",
		data: {
			organizationId: newOrganizationId,
			userId: newUserId
		}
	}
}
