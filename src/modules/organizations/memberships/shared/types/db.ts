// @/modules/organizations/memberships/shared/types/db.ts
import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type MembershipInsert = TablesInsert<"memberships">
export type MembershipRow = Tables<"memberships">
export type MembershipUpdate = TablesUpdate<"memberships">

export type RoleRow = Tables<"roles">
