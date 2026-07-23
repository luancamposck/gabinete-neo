// @/modules/fleet/server/actions/register-and-join-as-driver.action.ts

"use server"

import { registerAndJoinAsDriverUseCase } from "@/modules/fleet/server/use-cases/register-and-join-as-driver.use-case"
import type { RegisterAndJoinAsDriverActionCodes, RegisterAndJoinAsDriverActionData } from "@/modules/fleet/shared/types/flows/register-and-join-as-driver.types"
import { registerAsDriverSchemaServer } from "@/modules/fleet/shared/validations/slices/register-as-driver.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INVALID_INPUT = "Dados inválidos. Verifique os campos e tente novamente."
const MSG_SUCCESS = "Cadastro de motorista concluído com sucesso. Sua candidatura está em análise."
const MSG_GENERIC_ERROR = "Não foi possível finalizar o cadastro de motorista. Tente novamente mais tarde."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização."
const MSG_USERNAME_TAKEN = "Este nome de usuário já está em uso."
const MSG_PHONE_TAKEN = "Este telefone já está cadastrado."
const MSG_EMAIL_EXISTS = "Este email já está cadastrado."
const MSG_WEAK_PASSWORD = "A senha não atende aos requisitos mínimos de segurança."
const MSG_RATE_LIMIT = "Muitas tentativas. Aguarde um momento e tente novamente."
const MSG_SIGNUP_DISABLED = "Cadastro temporariamente indisponível."
const MSG_INVALID_SIGNUP = "Não foi possível concluir o cadastro. Verifique e-mail e senha."
const MSG_ROLE_NOT_FOUND = "Cargo não encontrado para esta constelação."
const MSG_ROLE_INACTIVE = "Este cargo está inativo e não pode ser usado."
const MSG_INVALID_FILE = "O documento enviado é inválido."
const MSG_PLATE_TAKEN = "Esta placa já está em uso por outra candidatura."
const MSG_PENDING_APPLICATION_EXISTS = "Você já possui uma candidatura pendente."

function toMessage(code: RegisterAndJoinAsDriverActionCodes): string {
	switch (code) {
		case "invalid_input":
			return MSG_INVALID_INPUT
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
		case "invalid_file":
			return MSG_INVALID_FILE
		case "plate_taken":
			return MSG_PLATE_TAKEN
		case "pending_application_exists":
			return MSG_PENDING_APPLICATION_EXISTS
		default:
			return MSG_GENERIC_ERROR
	}
}

export async function registerAndJoinAsDriverAction(formData: unknown): OperationResponse<RegisterAndJoinAsDriverActionData, RegisterAndJoinAsDriverActionCodes> {
	const parsed = registerAsDriverSchemaServer.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: toMessage("invalid_input"),
			code: "invalid_input"
		}
	}

	const useCaseRes = await registerAndJoinAsDriverUseCase({
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
		relationshipToInviter: parsed.data.relationshipToInviter,
		plate: parsed.data.plate,
		vehicleType: parsed.data.vehicleType,
		vehicleModel: parsed.data.vehicleModel,
		vehicleYear: parsed.data.vehicleYear,
		vehicleColor: parsed.data.vehicleColor,
		crlv: parsed.data.crlv,
		cnh: parsed.data.cnh
	})

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: toMessage(useCaseRes.code),
			code: useCaseRes.code
		}
	}

	return {
		success: true,
		message: MSG_SUCCESS,
		data: useCaseRes.data
	}
}
