// @/modules/fleet/shared/validations/vehicle.schema.ts

import { z } from "zod"
import { VEHICLE_TYPES, type VehicleType } from "@/modules/fleet/shared/constants/vehicle-types"

// ============================================================
// Placa (plate)
//
// Aceita dois formatos, normalizados para uppercase sem separadores:
// - Mercosul: ABC1D23  -> 3 letras, dígito, letra, 2 dígitos
// - Antigo:   ABC1234  -> 3 letras, 4 dígitos
// ============================================================
const PLATE_MERCOSUR_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/
const PLATE_OLD_REGEX = /^[A-Z]{3}[0-9]{4}$/

export function normalizePlate(value: string): string {
	return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
}

export function isValidPlate(value: string): boolean {
	const normalized = normalizePlate(value)
	return PLATE_MERCOSUR_REGEX.test(normalized) || PLATE_OLD_REGEX.test(normalized)
}

export const plateSchema = z.string().trim().transform(normalizePlate).refine(isValidPlate, "Placa inválida. Use o formato Mercosul (ABC1D23) ou antigo (ABC1234).")

// ============================================================
// Tipo de veículo (vehicle type)
// ============================================================
const VEHICLE_TYPE_VALUES = VEHICLE_TYPES as unknown as [VehicleType, ...VehicleType[]]

export const vehicleTypeSchema = z.enum(VEHICLE_TYPE_VALUES, {
	error: "Selecione um tipo de veículo válido."
})

// ============================================================
// Documento (CRLV / CNH)
//
// MIME de imagem/PDF, tamanho máximo de 10 MB por arquivo.
// ============================================================
export const MAX_DRIVER_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024

export const DRIVER_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const

export const driverDocumentFileSchema = z
	.file({ error: "Envie o documento." })
	.max(MAX_DRIVER_DOCUMENT_SIZE_BYTES, { error: "O documento deve ter no máximo 10 MB." })
	.mime(Array.from(DRIVER_DOCUMENT_MIME_TYPES), { error: "Arquivo inválido. Envie PDF, JPG, PNG ou WEBP." })
