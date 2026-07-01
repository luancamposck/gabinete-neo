// @/modules/fleet/server/slices/register-as-driver/actions/register-and-join-as-driver.action.ts

"use server"

import { registerAndJoinAsDriverUseCase } from "@/modules/fleet/server/slices/register-as-driver/use-cases/register-and-join-as-driver.use-case"
import type { RegisterAsDriverParams } from "@/modules/fleet/shared/types/inputs"
import { registerAsDriverSchemaServer } from "@/modules/fleet/shared/validations/register-as-driver.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type RegisterAndJoinAsDriverActionRes = {
	organizationId: string
	userId: string
	applicationId: string
}

type ErrorCodes = "invalid_input" | "invalid_file" | "org_not_found" | "plate_taken" | "application_pending_exists" | "infra_error"

const MSG_INVALID_INPUT = "Dados inválidos. Verifique os campos e tente novamente."

function getString(formData: FormData, ...keys: string[]) {
	for (const key of keys) {
		const value = formData.get(key)
		if (typeof value === "string") return value
	}

	return undefined
}

export async function registerAndJoinAsDriverAction(formData: FormData): OperationResponse<RegisterAndJoinAsDriverActionRes, ErrorCodes> {
	const parsed = registerAsDriverSchemaServer.safeParse({
		name: getString(formData, "name"),
		username: getString(formData, "username"),
		phone: getString(formData, "phone"),
		email: getString(formData, "email"),
		password: getString(formData, "password"),
		address: {
			cep: getString(formData, "cep"),
			state: getString(formData, "state"),
			city: getString(formData, "city"),
			neighborhood: getString(formData, "neighborhood"),
			street: getString(formData, "street"),
			number: getString(formData, "number"),
			complement: getString(formData, "complement")
		},
		ref: getString(formData, "ref"),
		relationshipToInviter: getString(formData, "relationshipToInviter", "relationship_to_inviter"),
		plate: getString(formData, "plate"),
		vehicleType: getString(formData, "vehicleType", "vehicle_type"),
		vehicleModel: getString(formData, "vehicleModel", "vehicle_model"),
		vehicleYear: getString(formData, "vehicleYear", "vehicle_year"),
		vehicleColor: getString(formData, "vehicleColor", "vehicle_color"),
		crlv: formData.get("crlv") ?? undefined,
		cnh: formData.get("cnh") ?? undefined
	})

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: MSG_INVALID_INPUT,
			code: "invalid_input"
		}
	}

	const params: RegisterAsDriverParams = {
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
	}

	return registerAndJoinAsDriverUseCase(params)
}
