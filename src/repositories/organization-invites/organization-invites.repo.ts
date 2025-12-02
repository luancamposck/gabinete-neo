import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { TablesInsert } from "@/lib/definitions/supabase"
import { createClient } from "@/lib/supabase/server"

export type OrganizationInvitesInsert = TablesInsert<"organization_invites">

export async function insertOrganizationInviteRepo(organizationInvitesInsertParams: OrganizationInvitesInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
  const supabaseAdmin = await createClient()

  return supabaseAdmin.from("organization_invites").insert(organizationInvitesInsertParams).select("id").single()
}
