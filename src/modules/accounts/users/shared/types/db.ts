// @/modules/accounts/users/shared/types/db.ts
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"

export type UserInsert = Omit<TablesInsert<"users">, "invite_code">
export type UserRow = Tables<"users">
export type UserUpdate = TablesUpdate<"users">
