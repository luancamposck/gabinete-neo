// @/modules/fleet/shared/types/db.ts
import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type DriverApplicationInsert = TablesInsert<"driver_applications">
export type DriverApplicationRow = Tables<"driver_applications">
export type DriverApplicationUpdate = TablesUpdate<"driver_applications">

export type DriverInsert = TablesInsert<"drivers">
export type DriverRow = Tables<"drivers">
export type DriverUpdate = TablesUpdate<"drivers">
