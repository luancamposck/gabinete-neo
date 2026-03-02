// @/modules/organizations/memberships/shared/types/db.ts
import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type MembershipInsert = TablesInsert<"organization_memberships">
export type MembershipRow = Tables<"organization_memberships">
export type MembershipUpdate = TablesUpdate<"organization_memberships">

export type RoleRow = Tables<"roles">
