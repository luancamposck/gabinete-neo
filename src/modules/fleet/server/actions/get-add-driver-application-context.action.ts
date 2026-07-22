// @/modules/fleet/server/actions/get-add-driver-application-context.action.ts

"use server"

import { getAddDriverApplicationContextUseCase } from "@/modules/fleet/server/use-cases/get-add-driver-application-context.use-case"
import type { GetAddDriverApplicationContextActionCodes, GetAddDriverApplicationContextActionData } from "@/modules/fleet/shared/types/slices/get-add-driver-application-context.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SUCCESS = "Contexto carregado com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerir candidaturas de frota."
const MSG_GENERIC_ERROR = "Não foi possível carregar os dados desta tela. Tente novamente mais tarde."

function toMessage(code: GetAddDriverApplicationContextActionCodes): string {
	switch (code) {
		case "unauthenticated":
			return MSG_UNAUTHENTICATED
		case "org_not_found":
			return MSG_ORG_NOT_FOUND
		case "not_allowed":
			return MSG_NOT_ALLOWED
		default:
			return MSG_GENERIC_ERROR
	}
}

export async function getAddDriverApplicationContextAction(): OperationResponse<GetAddDriverApplicationContextActionData, GetAddDriverApplicationContextActionCodes> {
	const useCaseRes = await getAddDriverApplicationContextUseCase()

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: toMessage(useCaseRes.code),
			code: useCaseRes.code
		}
	}

	const candidates = useCaseRes.data.candidates
	return {
		success: true,
		message: MSG_SUCCESS,
		data: {
			candidates
		}
	}
}
