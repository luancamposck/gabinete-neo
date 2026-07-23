"use server"

import { revalidatePath } from "next/cache"
import { reviewDriverApplicationUseCase } from "@/modules/fleet/server/use-cases/review-driver-application.use-case"
import type { ApproveDriverApplicationActionCodes, ApproveDriverApplicationActionData } from "@/modules/fleet/shared/types/flows/review-driver-application.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SUCCESS = "Candidatura aprovada com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerir candidaturas de frota."
const MSG_NOT_FOUND = "Candidatura não encontrada."
const MSG_ALREADY_REVIEWED = "Esta candidatura já foi revisada."
const MSG_GENERIC_ERROR = "Não foi possível aprovar a candidatura. Tente novamente em instantes."

function toMessage(code: ApproveDriverApplicationActionCodes): string {
	switch (code) {
		case "unauthenticated":
			return MSG_UNAUTHENTICATED
		case "org_not_found":
			return MSG_ORG_NOT_FOUND
		case "not_allowed":
			return MSG_NOT_ALLOWED
		case "not_found":
			return MSG_NOT_FOUND
		case "already_reviewed":
			return MSG_ALREADY_REVIEWED
		default:
			return MSG_GENERIC_ERROR
	}
}

export async function approveDriverApplicationAction(params: { applicationId: string }): OperationResponse<ApproveDriverApplicationActionData, ApproveDriverApplicationActionCodes> {
	const useCaseRes = await reviewDriverApplicationUseCase({
		applicationId: params.applicationId,
		action: "approve"
	})

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: toMessage(useCaseRes.code),
			code: useCaseRes.code
		}
	}

	revalidatePath("/dashboard/config/fleet")

	return {
		success: true,
		message: MSG_SUCCESS,
		data: {
			applicationId: useCaseRes.data.applicationId,
			driverId: useCaseRes.data.driverId
		}
	}
}
