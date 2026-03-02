// @/modules/accounts/users/profiles/shared/types/db.ts
import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type UserProfileInsert = TablesInsert<"user_profiles">
export type UserProfileRow = Tables<"user_profiles">
export type UserProfileUpdate = TablesUpdate<"user_profiles">
