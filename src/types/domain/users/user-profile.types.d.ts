import type { TablesInsert } from "@/lib/definitions/supabase"

export type UserProfileUpsert = TablesInsert<"user_profiles">
export type UserProfileUpdate = TablesUpdate<"user_profiles">
