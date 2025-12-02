"use server"

import { verifyInviteToken } from "@/lib/utils/token-utils"
import { createUserWithInvitationSchemaServer } from "@/lib/validations/use-cases/create-user-with-invitation-schemas/create-user-with-invitation-schemas.server"
import { type CreateUserWithInvitationServiceParams, createUserWithInvitationService } from "@/services/create-user-with-invitation.service"
import type { OperationResponse } from "@/types/operation-response"

export async function createUserWithInvitationAction(formData: unknown): Promise<OperationResponse<{ userId: string }>> {
	// 1) Validação do shape
	const dataParsed = createUserWithInvitationSchemaServer.safeParse(formData)

	if (!dataParsed.success) {
		console.error(dataParsed.error)

		return {
			success: false,
			message: dataParsed.error.message
		}
	}

	const { user: newUserData, inviteToken } = dataParsed.data

	// 2) Decodificar e validar token
	const decoded = await verifyInviteToken(inviteToken)

	if (!decoded) {
		return {
			success: false,
			message: "Convite inválido ou expirado."
		}
	}

	const { organizationId, inviterUserId } = decoded

	// 3) Chamar Service para criar user e criar row de convite
	const createUserWithInvitationServiceParams: CreateUserWithInvitationServiceParams = {
		user: {
			email: newUserData.email,
			password: newUserData.password,

			name: newUserData.name,
			cpf: newUserData.cpf,
			phone: newUserData.phone,

			cep: newUserData.adress.cep,
			street: newUserData.adress.street,
			number: newUserData.adress.number,
			neighborhood: newUserData.adress.neighborhood,
			city: newUserData.adress.city,
			state: newUserData.adress.state,
			complement: newUserData.adress.complement
		},

		createdByUserId: inviterUserId,

		organizationId: organizationId
	}
	const createUserWithInvitationServiceRes = await createUserWithInvitationService(createUserWithInvitationServiceParams)

	if (createUserWithInvitationServiceRes.success === false) {
		const errorMessage = createUserWithInvitationServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	const userId = createUserWithInvitationServiceRes.data.userId

	return {
		success: true,
		message: "Convite enviado com sucesso!",
		data: {
			userId: userId
		}
	}
}
