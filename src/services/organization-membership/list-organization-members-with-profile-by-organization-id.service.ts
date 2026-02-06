// src/services/organization-membership/list-organization-members-by-organization-id.service.ts

import { listOrganizationMembersWithProfileByOrganizationIdRepo } from "@/repositories/organization-menberships/organization-menberships.repo"

export async function listOrganizationMembersWithProfileByOrganizationIdService({ organizationId }: { organizationId: string }) {
	try {
		const { data: organizationMembersData, error: organizationMembersError } = await listOrganizationMembersWithProfileByOrganizationIdRepo({ organizationId })

		if (organizationMembersError) {
			console.error(`[listOrganizationMembersWithProfileByOrganizationIdService]: ${organizationMembersError.message}`)

			return {
				success: false,
				message: "Erro ao obter membros da constelação."
			}
		}

		return {
			success: true,
			message: "Membros da constelação obtidos com sucesso.",
			data: {
				organizationMembers: organizationMembersData ?? []
			}
		}
	} catch (err) {
		console.error("[listOrganizationMembersWithProfileByOrganizationIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter membros da constelação."
		}
	}
}
