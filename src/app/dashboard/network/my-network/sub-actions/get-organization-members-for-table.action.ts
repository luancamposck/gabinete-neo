// src/app/dashboard/network/my-network/get-organization-members-for-table.action.ts
"use server"

import { listOrganizationMembersWithProfileByOrganizationIdService } from "@/services/organization-membership/list-organization-members-with-profile-by-organization-id.service"
import type { OrganizationMemberWithUserProfile } from "@/types/domain/organization/organization-members-with-user-profile.types"
import type { OrganizationMemberAddressDTO, OrganizationMemberDTO, OrganizationMemberUserDTO } from "@/types/dto/organization-member.dto"
import type { OperationResponse } from "@/types/operation-response"

export async function getOrganizationMembersForTable({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ members: OrganizationMemberDTO[] }>> {
	const serviceRes = await listOrganizationMembersWithProfileByOrganizationIdService({ organizationId })

	if (!serviceRes.success || !serviceRes.data) {
		return {
			success: false,
			message: serviceRes.message ?? "Erro ao obter membros da constelação."
		}
	}

	const rawMembers = serviceRes.data.organizationMembers ?? []

	const members: OrganizationMemberDTO[] = rawMembers.map((member: OrganizationMemberWithUserProfile) => {
		const user = member.user
		const profile = user?.profile

		const address: OrganizationMemberAddressDTO = {
			cep: profile?.cep ?? null,
			street: profile?.street ?? null,
			number: profile?.number ?? null,
			complement: profile?.complement ?? null,
			neighborhood: profile?.neighborhood ?? null,
			city: profile?.city ?? null,
			state: profile?.state ?? null
		}

		const userDTO: OrganizationMemberUserDTO = {
			id: user?.id ?? member.user_id, // fallback pouco provável, mas ok
			name: user?.name ?? null,
			email: user?.email ?? "",
			phone: profile?.phone ?? null,
			address
		}

		return {
			organizationId: member.organization_id,
			userId: member.user_id,
			role: "MEMBER",
			isActive: member.is_active,
			createdAt: member.created_at,
			invitedByUserId: member.invited_by_user_id,
			user: userDTO
		}
	})

	return {
		success: true,
		message: serviceRes.message,
		data: {
			members
		}
	}
}
