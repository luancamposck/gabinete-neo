// @/modules/onboarding/server/actions/register-and-join.action.ts

"use server"

import { registerAndJoinSchemaServer } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"
import { registerAndJoinUseCase } from "@/modules/onboarding/server/use-cases/register-and-join.use-case"
import type { RegisterAndJoinActionCodes, RegisterAndJoinActionData } from "@/modules/onboarding/shared/types/slices/register-and-join.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INVALID_INPUT = "Dados inválidos. Verifique os campos e tente novamente."
const MSG_SUCCESS = "Cadastro concluído com sucesso."
const MSG_GENERIC_ERROR = "Erro inesperado ao finalizar o cadastro."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização."
const MSG_USERNAME_TAKEN = "Este nome de usuário já está em uso."
const MSG_PHONE_TAKEN = "Este telefone já está cadastrado."
const MSG_EMAIL_EXISTS = "Este email já está cadastrado."
const MSG_WEAK_PASSWORD = "A senha não atende aos requisitos mínimos de segurança. Tente uma senha mais forte."
const MSG_RATE_LIMIT = "Muitas tentativas. Aguarde um momento e tente novamente."
const MSG_SIGNUP_DISABLED = "Cadastro temporariamente indisponível."
const MSG_INVALID_SIGNUP = "Não foi possível concluir o cadastro. Verifique e-mail e senha e tente novamente."
const MSG_ROLE_NOT_FOUND = "Cargo não encontrado para esta constelação."
const MSG_ROLE_INACTIVE = "Este cargo está inativo e não pode ser usado."

function toErrorMessage(code: RegisterAndJoinActionCodes): string {
	switch (code) {
		case "org_not_found":
			return MSG_ORG_NOT_FOUND
		case "username_taken":
			return MSG_USERNAME_TAKEN
		case "phone_taken":
			return MSG_PHONE_TAKEN
		case "email_exists":
			return MSG_EMAIL_EXISTS
		case "weak_password":
			return MSG_WEAK_PASSWORD
		case "rate_limit":
			return MSG_RATE_LIMIT
		case "signup_disabled":
			return MSG_SIGNUP_DISABLED
		case "invalid_signup":
			return MSG_INVALID_SIGNUP
		case "role_not_found":
			return MSG_ROLE_NOT_FOUND
		case "role_inactive":
			return MSG_ROLE_INACTIVE
		case "invalid_input":
			return MSG_INVALID_INPUT
		default:
			return MSG_GENERIC_ERROR
	}
}

export async function registerAndJoinAction(formData: unknown): OperationResponse<RegisterAndJoinActionData, RegisterAndJoinActionCodes> {
	const parsed = registerAndJoinSchemaServer.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)

		return {
			success: false,
			message: toErrorMessage("invalid_input"),
			code: "invalid_input"
		}
	}

	const registerAndJoinUseCaseRes = await registerAndJoinUseCase({
		name: parsed.data.name,
		username: parsed.data.username,
		phone: parsed.data.phone,

		email: parsed.data.email,
		password: parsed.data.password,

		cep: parsed.data.address.cep,
		state: parsed.data.address.state,
		city: parsed.data.address.city,
		neighborhood: parsed.data.address.neighborhood,
		street: parsed.data.address.street,
		number: parsed.data.address.number,
		complement: parsed.data.address.complement,

		ref: parsed.data.ref,
		relationshipToInviter: parsed.data.relationshipToInviter
	})

	if (registerAndJoinUseCaseRes.success === false) {
		return {
			success: false,
			message: toErrorMessage(registerAndJoinUseCaseRes.code),
			code: registerAndJoinUseCaseRes.code
		}
	}

	return {
		success: true,
		message: MSG_SUCCESS,
		data: {
			userId: registerAndJoinUseCaseRes.data.userId,
			organizationId: registerAndJoinUseCaseRes.data.organizationId
		}
	}
}
