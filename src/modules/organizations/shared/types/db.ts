// @/modules/accounts/users/shared/types/db.ts
import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type OrganizationInsert = TablesInsert<"organizations">
export type OrganizationRow = Tables<"organizations">
export type OrganizationUpdate = TablesUpdate<"organizations">
