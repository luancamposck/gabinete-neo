"use server"

import { createPartnerWithOwnerSchemaServer } from "@/lib/validations/use-cases/create-partner-with-owner-user/create-partner-with-owner-user.server"
import { type CreatePartnerWithOwnerUserServiceParams, createPartnerWithOwnerUserService } from "@/services/create-partner-with-owner-user.service"
import type { OperationResponse } from "@/types/operation-response"

export async function createPartnerWithOwnerUserAction(formData: unknown): Promise<OperationResponse<{ userId: string; partnerId: string }>> {
	// 1) Validação
	const dataParsed = createPartnerWithOwnerSchemaServer.safeParse(formData)

	if (!dataParsed.success) {
		console.error(dataParsed.error)
		return { success: false, message: dataParsed.error.message }
	}

	const { partner: newPartnerData, user: newUserData } = dataParsed.data

	// 2) Criação de empresa parceira(partner) e user com profile
	const createPartnerWithOwnerUserServiceParams: CreatePartnerWithOwnerUserServiceParams = {
		partner: {
			cnpj: newPartnerData.cnpj,
			legal_business_name: newPartnerData.legalBusinessName,
			contact_email: newPartnerData.contactEmail,
			contact_name: newPartnerData.contactName,
			contact_phone: newPartnerData.contactMobile,

			cep: newPartnerData.adress.cep,
			street: newPartnerData.adress.street,
			number: newPartnerData.adress.number,
			neighborhood: newPartnerData.adress.neighborhood,
			city: newPartnerData.adress.city,
			state: newPartnerData.adress.state,
			complement: newPartnerData.adress.complement
		},

		user: {
			name: newUserData.name,
			cpf: newUserData.cpf,

			email: newUserData.email,
			password: newUserData.password,
			phone: newUserData.phone,

			cep: newUserData.adress.cep,
			city: newUserData.adress.city,
			neighborhood: newUserData.adress.neighborhood,
			number: newUserData.adress.number,
			street: newUserData.adress.street,
			state: newUserData.adress.state,
			complement: newUserData.adress.complement
		}
	}

	const createPartnerWithOwnerUserServiceRes = await createPartnerWithOwnerUserService(createPartnerWithOwnerUserServiceParams)
	if (createPartnerWithOwnerUserServiceRes.success === false) {
		return {
			success: false,
			message: createPartnerWithOwnerUserServiceRes.message
		}
	}

	const { partnerId, userId } = createPartnerWithOwnerUserServiceRes.data

	// 3) Tudo deu certo
	return {
		success: true,
		message: "",
		data: {
			partnerId,
			userId
		}
	}
}
