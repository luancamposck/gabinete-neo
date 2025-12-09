import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"

export type PublicUserInsert = TablesInsert<"users">
export type PublicUserRow = Tables<"users">
export type PublicUserUpdate = TablesUpdate<"users">
