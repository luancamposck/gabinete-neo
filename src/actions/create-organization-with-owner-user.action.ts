"use server"

import { createOrganizationWithOwnerSchemaServer } from "@/lib/validations/use-cases/create-organization-with-owner-schemas/create-organization-with-owner-schema.server"
import type { OperationResponse } from "@/types/operation-response"
import { type CreateOrganizationWithOwnerUserServiceParams, createOrganizationWithOwnerUserService } from "@/use-cases/create-organization-with-owner-user.service"

export async function createOrganizationWithOwnerAction(formData: unknown): Promise<OperationResponse<{ organizationId: string; userId: string }>> {
	// 1) Validação
	const dataParsed = createOrganizationWithOwnerSchemaServer.safeParse(formData)

	if (!dataParsed.success) {
		console.error(dataParsed.error)

		return {
			success: false,
			message: dataParsed.error.message
		}
	}

	const { organization: newOrganizationData, user: newUserData } = dataParsed.data

	// 2) Uso da Service para criar organização, user, user profile e relação de orgn e user
	const createOrganizationWithOwnerUserServiceParams: CreateOrganizationWithOwnerUserServiceParams = {
		user: {
			email: newUserData.email,
			password: newUserData.password,

			name: newUserData.name,
			phone: newUserData.phone,

			cep: newUserData.adress.cep,
			street: newUserData.adress.street,
			number: newUserData.adress.number,
			neighborhood: newUserData.adress.neighborhood,
			city: newUserData.adress.city,
			state: newUserData.adress.state,
			complement: newUserData.adress.complement
		},

		organization: {
			app_domain: "",
			name: newOrganizationData.name,
			slug: newOrganizationData.slug
		}
	}
	const createOrganizationWithOwnerUserServiceRes = await createOrganizationWithOwnerUserService(createOrganizationWithOwnerUserServiceParams)

	if (createOrganizationWithOwnerUserServiceRes.success === false) {
		const errorMessage = createOrganizationWithOwnerUserServiceRes.message

		console.error(errorMessage)

		return {
			success: false,
			message: errorMessage
		}
	}

	const userId = createOrganizationWithOwnerUserServiceRes.data.userId
	const organizationId = createOrganizationWithOwnerUserServiceRes.data.organizationId

	// 5) Retorno se deu tudo certo
	return {
		success: true,
		message: "Usuário e constelação criados com sucesso",
		data: {
			organizationId: organizationId,
			userId: userId
		}
	}
}
