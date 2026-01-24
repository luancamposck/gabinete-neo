// @/modules/organizations/referrals/shared/types/db.ts

import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"

export type OrganizationReferralRow = Tables<"organization_referrals">
export type OrganizationReferralInsert = TablesInsert<"organization_referrals">
export type OrganizationReferralUpdate = TablesUpdate<"organization_referrals">
