// @/modules/fleet/server/actions/add-driver-application.action.ts

"use server"

import { revalidatePath } from "next/cache"
import { addDriverApplicationUseCase } from "@/modules/fleet/server/use-cases/add-driver-application.use-case"
import type { AddDriverApplicationActionCodes, AddDriverApplicationActionData } from "@/modules/fleet/shared/types/slices/add-driver-application.types"
import { addDriverApplicationSchema } from "@/modules/fleet/shared/validations/slices/add-driver-application.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SUCCESS = "Candidatura de motorista adicionada com sucesso."
const MSG_INVALID_INPUT = "Dados inválidos. Verifique os campos e tente novamente."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerir candidaturas de frota."
const MSG_CANDIDATE_NOT_MEMBER = "O usuário selecionado não é membro desta organização."
const MSG_PLATE_TAKEN = "Esta placa já está em uso por outra candidatura."
const MSG_PENDING_APPLICATION_EXISTS = "Este usuário já possui uma candidatura pendente."
const MSG_GENERIC_ERROR = "Não foi possível adicionar a candidatura de motorista. Tente novamente mais tarde."

function toMessage(code: AddDriverApplicationActionCodes): string {
	switch (code) {
		case "invalid_input":
			return MSG_INVALID_INPUT
		case "unauthenticated":
			return MSG_UNAUTHENTICATED
		case "org_not_found":
			return MSG_ORG_NOT_FOUND
		case "not_allowed":
			return MSG_NOT_ALLOWED
		case "candidate_not_member":
			return MSG_CANDIDATE_NOT_MEMBER
		case "plate_taken":
			return MSG_PLATE_TAKEN
		case "pending_application_exists":
			return MSG_PENDING_APPLICATION_EXISTS
		default:
			return MSG_GENERIC_ERROR
	}
}

export async function addDriverApplicationAction(formData: unknown): OperationResponse<AddDriverApplicationActionData, AddDriverApplicationActionCodes> {
	const parsed = addDriverApplicationSchema.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: toMessage("invalid_input"),
			code: "invalid_input"
		}
	}

	const useCaseRes = await addDriverApplicationUseCase({
		candidateUserId: parsed.data.candidateUserId,
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

	revalidatePath("/dashboard/config/fleet")

	const applicationId = useCaseRes.data.applicationId

	return {
		success: true,
		message: MSG_SUCCESS,
		data: {
			applicationId
		}
	}
}
