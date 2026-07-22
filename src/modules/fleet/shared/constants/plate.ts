// @/modules/fleet/shared/constants/plate.ts

// ============================================================
// Regexes de placa (normalizadas: uppercase, sem separadores)
//
// - Mercosul: ABC1D23  -> 3 letras, dígito, letra, 2 dígitos
// - Antigo:   ABC1234  -> 3 letras, 4 dígitos
//
// Espelham o check constraint do banco em
// supabase/migrations/27_create_driver_applications.sql:
//   check (plate ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$')
// que é a forma unificada dos dois regexes abaixo.
// ============================================================
export const PLATE_MERCOSUL_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/
export const PLATE_OLD_REGEX = /^[A-Z]{3}[0-9]{4}$/
