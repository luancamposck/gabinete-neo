// @/modules/organizations/memberships/server/slices/update-membership-status/actions/update-membership-status.action.ts
"use server"

import { revalidatePath } from "next/cache"

import { updateMembershipStatusUseCase } from "@/modules/organizations/memberships/server/slices/update-membership-status/use-cases/update-membership-status.use-case"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type UpdateMembershipStatusActionParams = {
	memberUserId: string
	isActive: boolean
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "membership_not_found" | "cannot_deactivate_self" | "infra_error"

export async function updateMembershipStatusAction(params: UpdateMembershipStatusActionParams): OperationResponse<{ memberUserId: string; isActive: boolean }, ErrorCodes> {
	// ============================================================
	// 0) Delegar toda regra de negócio para o use-case
	//
	// Possibilidades:
	// - erro de validação/permissão/domínio => retorna erro sem revalidate
	// - sucesso => segue para revalidar a tela
	// ============================================================
	const useCaseRes = await updateMembershipStatusUseCase(params)

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	// ============================================================
	// 1) Revalidar listagem do network após update bem-sucedido
	//
	// Objetivo:
	// - garantir que a tabela reflita o novo status (ativo/inativo)
	// ============================================================
	revalidatePath("/dashboard/network/my-network")

	// ============================================================
	// OK: repassar resultado de sucesso do use-case
	// ============================================================
	return useCaseRes
}
