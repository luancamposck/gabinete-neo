// @/modules/fleet/shared/validations/plate.schema.ts

import { z } from "zod"
import { PLATE_MERCOSUL_REGEX, PLATE_OLD_REGEX } from "@/modules/fleet/shared/constants/plate"

export function normalizePlate(value: string): string {
	return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
}

export function isValidPlate(value: string): boolean {
	const normalized = normalizePlate(value)
	return PLATE_MERCOSUL_REGEX.test(normalized) || PLATE_OLD_REGEX.test(normalized)
}

export const plateSchema = z.string().trim().transform(normalizePlate).refine(isValidPlate, "Placa inválida. Use o formato Mercosul (ABC1D23) ou antigo (ABC1234).")
