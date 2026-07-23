"use server"

import { getFleetDriversForTableUseCase } from "@/modules/fleet/server/use-cases/get-fleet-drivers-for-table.use-case"
import type { GetFleetDriversForTableActionCodes, GetFleetDriversForTableActionData } from "@/modules/fleet/shared/types/flows/get-fleet-drivers-for-table.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SUCCESS = "Motoristas da frota carregados com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para acessar a gestão da frota."
const MSG_GENERIC_ERROR = "Não foi possível carregar os motoristas da frota. Tente novamente em instantes."

function toMessage(code: GetFleetDriversForTableActionCodes): string {
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

export async function getFleetDriversForTableAction(): OperationResponse<GetFleetDriversForTableActionData, GetFleetDriversForTableActionCodes> {
	const useCaseRes = await getFleetDriversForTableUseCase()

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
