import type { Tables, TablesInsert } from "@/lib/definitions/supabase"

export type PublicUserInsert = TablesInsert<"users">
export type PublicUserRow = Tables<"users">
