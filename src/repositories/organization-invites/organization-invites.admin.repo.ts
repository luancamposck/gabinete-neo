// src/repositories/organization-invites/organization-invites.admin.repo.ts
import "server-only"

import type { PostgrestSingleResponse } from "@supabase/supabase-js"
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

// Types utilitários
export type OrganizationInvitesRow = Tables<"organization_invites">
export type OrganizationInvitesInsert = TablesInsert<"organization_invites">
export type OrganizationInvitesUpdate = TablesUpdate<"organization_invites">

/**
 * Insert admin (se em algum momento você quiser criar invites
 * via job/sistema e ignorar RLS).
 */
export async function insertOrganizationInviteAdminRepo(organizationInvitesInsertParams: OrganizationInvitesInsert): Promise<PostgrestSingleResponse<OrganizationInvitesRow>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_invites").insert(organizationInvitesInsertParams).select("*").single()
}

/**
 * Busca um invite por ID usando o client admin.
 *
 * Usamos `maybeSingle()` porque "não existe" é um caso normal
 * (service decide se isso é erro de negócio ou não).
 */
export async function findOrganizationInviteByIdAdminRepo({ inviteId }: { inviteId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_invites").select("*").eq("id", inviteId).maybeSingle()
}

/**
 * Atualiza status de um invite e marca quem tratou (handled_by_user_id)
 * + handled_at (timestamp atual).
 *
 * Esse é o cara que a service de aprovação vai usar.
 */
export async function updateOrganizationInviteStatusAdminRepo({
	inviteId,
	status,
	handledByUserId
}: {
	inviteId: string
	status: OrganizationInvitesRow["status"] // 'PENDING' | 'APPROVED' | ...
	handledByUserId: string
}): Promise<PostgrestSingleResponse<OrganizationInvitesRow>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("organization_invites")
		.update({
			status,
			handled_by_user_id: handledByUserId,
			handled_at: new Date().toISOString()
		} satisfies Partial<OrganizationInvitesUpdate>)
		.eq("id", inviteId)
		.select("*")
		.single()
}

/**
 * (Extra útil pro data-table da org)
 * Lista convites de uma organização, opcionalmente filtrando por status.
 */
export async function listOrganizationInvitesByOrganizationIdAdminRepo({
	organizationId,
	status
}: {
	organizationId: string
	status?: OrganizationInvitesRow["status"] // opcional: 'PENDING' | 'APPROVED' | ...
}) {
	const supabaseAdmin = createAdminClient()

	let query = supabaseAdmin.from("organization_invites").select("*").eq("organization_id", organizationId)

	if (status) {
		query = query.eq("status", status)
	}

	// Aqui pode ser `.returns<OrganizationInvitesRow[]>()` se quiser tipar mais,
	// mas supabase já infere legal.
	return query
}
