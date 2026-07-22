// @/modules/fleet/shared/validations/slices/add-driver-application.schema.ts

import { z } from "zod"
import { driverDocumentFileSchema } from "@/modules/fleet/shared/validations/driver-document.schema"
import { plateSchema } from "@/modules/fleet/shared/validations/plate.schema"
import { vehicleColorSchema, vehicleModelSchema, vehicleTypeSchema, vehicleYearSchema } from "@/modules/fleet/shared/validations/vehicle.schema"

export const addDriverApplicationSchema = z.object({
	// Candidato: conta já existente na organização, selecionada pelo admin
	candidateUserId: z.uuid({ error: "Selecione um usuário válido." }),

	// Veículo
	plate: plateSchema,
	vehicleType: vehicleTypeSchema,
	vehicleModel: vehicleModelSchema,
	vehicleYear: vehicleYearSchema,
	vehicleColor: vehicleColorSchema,

	// Documentos
	crlv: driverDocumentFileSchema,
	cnh: driverDocumentFileSchema
})

export type AddDriverApplicationSchemaData = z.infer<typeof addDriverApplicationSchema>
