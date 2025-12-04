import { insertOrganizationInviteRepo, type OrganizationInvitesInsert } from "@/repositories/organization-invites/organization-invites.repo"
import type { OperationResponse } from "@/types/operation-response"

export interface CreateOrganizationInviteServiceParams {
	organizationId: string
	requestedByUserId: string
	createdByUserId: string
	role?: "MEMBER" | "ADMIN" // opcional, default MEMBER
	origin?: "PUBLIC_LINK" | "EMAIL_INVITE" | "INTERNAL" // opcional
	expiresInDays?: number // opcional, default 7
}

function computeExpiresAt(days: number): string {
	const now = new Date()
	now.setDate(now.getDate() + days)
	return now.toISOString() // Supabase aceita Date ou ISO string
}

export async function createOrganizationInviteService(params: CreateOrganizationInviteServiceParams): Promise<OperationResponse<{ organizationInviteId: string }>> {
	const { organizationId, requestedByUserId, role = "MEMBER", origin = "PUBLIC_LINK", expiresInDays = 7, createdByUserId } = params

	const expiresAt = new Date()
	expiresAt.setDate(expiresAt.getDate() + expiresInDays)

	const insertParams: OrganizationInvitesInsert = {
		organization_id: organizationId,
		requested_by_user_id: requestedByUserId,
		created_by_user_id: createdByUserId,
		role,
		status: "PENDING",
		origin,
		expires_at: expiresAt.toISOString() // ou diretamente `expiresAt`
	}

	const { data: organizationInviteResData, error: organizationInviteResError } = await insertOrganizationInviteRepo(insertParams)

	if (organizationInviteResError || !organizationInviteResData) {
		console.error(`[createOrganizationInviteService]: ${organizationInviteResError.message}`)

		let errorMessage = "Não foi possível realizar o pedido para entrar na organização."

		if (organizationInviteResError?.code === "23505") {
			errorMessage = "Pedido já foi enviado."
		}

		return {
			success: false,
			message: errorMessage
		}
	}

	const newOrganizationInviteId = organizationInviteResData.id

	return {
		success: true,
		message: "Relação entre organização e usuário criada com sucesso.",
		data: {
			organizationInviteId: newOrganizationInviteId
		}
	}
}
