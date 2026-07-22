// @/modules/fleet/shared/validations/slices/register-as-driver.schema.ts

import type { z } from "zod"
import { registerAndJoinSchemaClient, registerAndJoinSchemaServer } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"
import { driverDocumentFileSchema } from "@/modules/fleet/shared/validations/driver-document.schema"
import { plateSchema } from "@/modules/fleet/shared/validations/plate.schema"
import { vehicleColorSchema, vehicleModelSchema, vehicleTypeSchema, vehicleYearSchema } from "@/modules/fleet/shared/validations/vehicle.schema"

// ============================================================
// Campos de veículo (compartilhados entre client e server)
//
// placa e tipo obrigatórios; modelo/ano/cor opcionais.
// ============================================================
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
