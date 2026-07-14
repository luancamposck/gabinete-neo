// @/modules/organizations/referrals/shared/types/db.ts

import type { Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type OrganizationReferralRow = Tables<"referrals">
export type OrganizationReferralInsert = TablesInsert<"referrals">
export type OrganizationReferralUpdate = TablesUpdate<"referrals">
