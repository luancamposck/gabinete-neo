"use server"

import { editUserWithProfileBaseSchemaServer } from "@/lib/validations/use-cases/edit-user-with-profile-schemas/edit-user-with-profile-schemas.server"
import { type UpdateMyAccountServiceParams, updateMyAccountService } from "@/services/users/update-my-account.service"
import type { OperationResponse } from "@/types/operation-response"

export async function updateMyAccountAction(formData: unknown, userId: string): Promise<OperationResponse<null>> {
	// 1) Validação do shape
	const dataParsed = editUserWithProfileBaseSchemaServer.safeParse(formData)

	if (!dataParsed.success) {
		console.error(dataParsed.error)

		return {
			success: false,
			message: dataParsed.error.message
		}
	}

	const user = dataParsed.data

	// 2) Tentar atualizar dados do usuário
	const updateMyAccountServiceParams: UpdateMyAccountServiceParams = {
		userId: userId,
		name: user.name,
		phone: user.phone,

		cep: user.adress.cep,
		street: user.adress.street,
		number: user.adress.number,
		neighborhood: user.adress.neighborhood,
		city: user.adress.city,
		state: user.adress.state,
		complement: user.adress.complement
	}
	const updateMyAccountServiceRes = await updateMyAccountService(updateMyAccountServiceParams)

	if (updateMyAccountServiceRes.success === false) {
		return {
			success: false,
			message: "Erro ao tentar atualizar os dados, por favor tente normalmente mais tarde."
		}
	}

	return {
		success: true,
		message: "Dados atualizados com sucesso.",
		data: null
	}
}
