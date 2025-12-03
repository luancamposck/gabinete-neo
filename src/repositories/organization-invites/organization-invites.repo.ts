// src/repositories/organization-invites/organization-invites.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"
import type { Tables, TablesInsert } from "@/lib/definitions/supabase"
import { createClient } from "@/lib/supabase/server"
import type { OrganizationInviteWithRequestedUser } from "@/types/organization-invite"

export type OrganizationInvitesInsert = TablesInsert<"organization_invites">
export type OrganizationInviteRow = Tables<"organization_invites">

export async function insertOrganizationInviteRepo(organizationInvitesInsertParams: OrganizationInvitesInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabase = await createClient()

	return supabase.from("organization_invites").insert(organizationInvitesInsertParams).select("id").single()
}

export async function getPendingOrganizationInviteByUserIdRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase.from("organization_invites").select("*").eq("requested_by_user_id", userId).eq("status", "PENDING").maybeSingle()
}

/**
 * Lista invites de uma org já trazendo o usuário convidado (requested_user).
 */
export async function listOrganizationInvitesWithRequestedUserByOrgRepo({ organizationId, status }: { organizationId: string; status?: OrganizationInviteRow["status"] }): Promise<{
	data: OrganizationInviteWithRequestedUser[] | null
	error: any
}> {
	const supabase = await createClient()

	let query = supabase
		.from("organization_invites")
		.select(
			`
      id,
      organization_id,
      requested_by_user_id,
      created_by_user_id,
      role,
      status,
      origin,
      expires_at,
      created_at,
      handled_at,
      requested_user:users!organization_invites_requested_by_user_id_fkey (
        id,
        name,
        email
      )
    `
		)
		.eq("organization_id", organizationId)

	if (status) {
		query = query.eq("status", status)
	}

	const { data, error } = await query

	return {
		data: data as OrganizationInviteWithRequestedUser[] | null,
		error
	}
}
