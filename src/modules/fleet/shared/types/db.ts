// @/modules/fleet/shared/types/db.ts
import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type DriverApplicationInsert = TablesInsert<"driver_applications">
export type DriverApplicationRow = Tables<"driver_applications">
export type DriverApplicationUpdate = TablesUpdate<"driver_applications">

export type VehicleType = Enums<"driver_vehicle_type">

export type DriverInsert = TablesInsert<"drivers">
export type DriverRow = Tables<"drivers">
export type DriverUpdate = TablesUpdate<"drivers">
