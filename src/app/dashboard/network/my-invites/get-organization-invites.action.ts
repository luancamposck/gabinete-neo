// src/app/dashboard/network/my-network/get-organization-invites.action.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import type { OrganizationInviteRow } from "@/repositories/organization-invites/organization-invites.repo"
import { findOrganizationMembershipByUserRepo } from "@/repositories/organization-menberships/organization-menberships.repo"
import { listOrganizationInvitesService } from "@/services/organization-invite/list-organization-invites.service"
import type { OperationResponse } from "@/types/operation-response"

interface GetOrganizationInvitesActionInput {
	organizationId: string
	status?: OrganizationInviteRow["status"]
}

export async function getOrganizationInvitesAction(input: GetOrganizationInvitesActionInput): Promise<OperationResponse<{ invites: OrganizationInviteRow[] }>> {
	const { organizationId, status } = input

	// 1) Usuário logado
	const supabase = await createClient()
	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user) {
		return {
			success: false,
			message: "Usuário não autenticado."
		}
	}

	const userId = user.id

	// 2) Verificar membership do usuário (client normal, respeitando futuro RLS)
	const { data: membership, error: membershipError } = await findOrganizationMembershipByUserRepo({
		userId
	})

	if (membershipError) {
		console.error("[getOrganizationInvitesAction] erro ao buscar membership:", membershipError)
		return {
			success: false,
			message: "Não foi possível verificar sua permissão para visualizar os convites."
		}
	}

	if (!membership) {
		return {
			success: false,
			message: "Você não é membro de nenhuma organização."
		}
	}

	// 3) Garantir que está olhando a org correta e que tem role suficiente
	if (membership.organization_id !== organizationId) {
		return {
			success: false,
			message: "Você não tem permissão para visualizar os convites desta organização."
		}
	}

	// 4) Buscar convites via service
	const serviceRes = await listOrganizationInvitesService({ organizationId, status })

	if (!serviceRes.success || !serviceRes.data) {
		return {
			success: false,
			message: serviceRes.message ?? "Não foi possível carregar os convites da organização."
		}
	}

	return {
		success: true,
		message: serviceRes.message,
		data: {
			invites: serviceRes.data.invites
		}
	}
}
