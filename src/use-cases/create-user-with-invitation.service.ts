import type { OperationResponse } from "@/types/operation-response"
import { createOrganizationInviteService } from "../services/organization-invite/create-organization-invite.service"
import { type CreateUserServiceParams, createUserWithProfileService } from "../services/users/create-user-with-profile.service"

export interface CreateUserWithInvitationServiceParams {
	user: CreateUserServiceParams

	createdByUserId: string

	organizationId: string
}

export async function createUserWithInvitationService(params: CreateUserWithInvitationServiceParams): Promise<OperationResponse<{ userId: string }>> {
	const { user: newUserData, organizationId, createdByUserId } = params

	// 1) Cria o usuário
	const createUserWithProfileServiceParams: CreateUserServiceParams = {
		email: newUserData.email,
		password: newUserData.password,

		name: newUserData.name,
		cpf: newUserData.cpf,
		phone: newUserData.phone,

		cep: newUserData.cep,
		street: newUserData.street,
		number: newUserData.number,
		neighborhood: newUserData.neighborhood,
		city: newUserData.city,
		state: newUserData.state,
		complement: newUserData.complement
	}

	const createUserWithProfileServiceRes = await createUserWithProfileService(createUserWithProfileServiceParams)

	if (!createUserWithProfileServiceRes.success || !createUserWithProfileServiceRes.data) {
		const errorMessage = createUserWithProfileServiceRes.message
		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	const createdUserId = createUserWithProfileServiceRes.data.id

	// 2) Cria o invite na organization_invites
	const createOrganizationInviteServiceRes = await createOrganizationInviteService({
		organizationId: organizationId,
		requestedByUserId: createdUserId,
		createdByUserId: createdByUserId,
		role: "MEMBER", // opcional, já default
		origin: "PUBLIC_LINK", // opcional, já default
		expiresInDays: 7
	})

	if (!createOrganizationInviteServiceRes.success) {
		const errorMessage = createOrganizationInviteServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	return {
		success: true,
		message: "Usuário criado e pedido de acesso à organização registrado com sucesso.",
		data: {
			userId: createdUserId
		}
	}
}
