// @/modules/fleet/shared/validations/vehicle.schema.ts

import { z } from "zod"
import { VEHICLE_TYPES } from "@/modules/fleet/shared/constants/vehicle-type"

function emptyStringToUndefined(value: unknown) {
	return typeof value === "string" && value.trim() === "" ? undefined : value
}

// ============================================================
// Tipo de veículo (vehicle type)
//
// Valores vindos do enum do banco via constants/vehicle-type.
// ============================================================
export const vehicleTypeSchema = z.enum(VEHICLE_TYPES, "Selecione um tipo de veículo válido.")

// ============================================================
// Campos de veículo opcionais (modelo/ano/cor)
// ============================================================
export const vehicleModelSchema = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(80).optional())
export const vehicleColorSchema = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(40).optional())
export const vehicleYearSchema = z.preprocess(
	emptyStringToUndefined,
	z.coerce
		.number()
		.int("Ano inválido.")
		.min(1900, "Ano inválido.")
		.max(new Date().getFullYear() + 1, "Ano inválido.")
		.optional()
)
