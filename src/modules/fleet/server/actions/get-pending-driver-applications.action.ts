"use server"

import { getPendingDriverApplicationsUseCase } from "@/modules/fleet/server/use-cases/get-pending-driver-applications.use-case"
import type { GetPendingDriverApplicationsActionCodes, GetPendingDriverApplicationsActionData } from "@/modules/fleet/shared/types/flows/get-pending-driver-applications.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SUCCESS = "Candidaturas pendentes carregadas com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerir candidaturas de frota."
const MSG_GENERIC_ERROR = "Não foi possível carregar as candidaturas. Tente novamente em instantes."

function toMessage(code: GetPendingDriverApplicationsActionCodes): string {
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

export async function getPendingDriverApplicationsAction(): OperationResponse<GetPendingDriverApplicationsActionData, GetPendingDriverApplicationsActionCodes> {
	const useCaseRes = await getPendingDriverApplicationsUseCase()

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
