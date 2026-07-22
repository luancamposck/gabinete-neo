// @/modules/fleet/shared/validations/register-as-driver.schema.ts

import { z } from "zod"
import { registerAndJoinSchemaClient, registerAndJoinSchemaServer } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"
import { driverDocumentFileSchema } from "@/modules/fleet/shared/validations/driver-document.schema"
import { plateSchema } from "@/modules/fleet/shared/validations/plate.schema"
import { vehicleTypeSchema } from "@/modules/fleet/shared/validations/vehicle.schema"

function emptyStringToUndefined(value: unknown) {
	return typeof value === "string" && value.trim() === "" ? undefined : value
}

// ============================================================
// Campos de veículo (compartilhados entre client e server)
//
// placa e tipo obrigatórios; modelo/ano/cor opcionais.
// ============================================================
const vehicleModelSchema = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(80).optional())
const vehicleColorSchema = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(40).optional())
const vehicleYearSchema = z.preprocess(
	emptyStringToUndefined,
	z.coerce
		.number()
		.int("Ano inválido.")
		.min(1900, "Ano inválido.")
		.max(new Date().getFullYear() + 1, "Ano inválido.")
		.optional()
)

const registerAsDriverFields = {
	// Veículo
	plate: plateSchema,
	vehicleType: vehicleTypeSchema,
	vehicleModel: vehicleModelSchema,
	vehicleYear: vehicleYearSchema,
	vehicleColor: vehicleColorSchema,

	// Documentos
	crlv: driverDocumentFileSchema,
	cnh: driverDocumentFileSchema
}

// ============================================================
// Client schema
//
// Estende os campos do registerAndJoinSchema + veículo + documentos
// (CRLV e CNH obrigatórios). Mantém os refines de senha/email.
// ============================================================
export const registerAsDriverSchemaClient = registerAndJoinSchemaClient.safeExtend(registerAsDriverFields)

export type RegisterAsDriverSchemaClientData = z.infer<typeof registerAsDriverSchemaClient>

// ============================================================
// Server schema
//
// Sem confirmEmail/confirmPassword; documentos validados aqui.
// ============================================================
export const registerAsDriverSchemaServer = registerAndJoinSchemaServer.extend(registerAsDriverFields)

export type RegisterAsDriverSchemaServerData = z.infer<typeof registerAsDriverSchemaServer>
