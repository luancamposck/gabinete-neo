// @/modules/accounts/onboarding/server/slices/register-and-join/steps/ensure-membership.step.ts

import { signOutService } from "@/modules/auth/server/services/sign-out.service"
import { createOrganizationMembershipService } from "@/modules/organizations/memberships/server/services/create-membership.service"
import { getRoleByNameService } from "@/modules/organizations/memberships/server/services/get-role-by-name.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type EnsureMembershipStepParams = {
	organizationId: string
	userId: string
	invitedByUserId?: string | null

	// usado pra decidir se faz signOut em falhas (quando é "existing")
	mode: "new" | "existing"
}

type EnsureMembershipStepRes = {
	joinedNow: boolean
}

const prefixLog = "[ensureMembershipStep]:"
const GENERIC_ERROR_MESSAGE = "Erro inesperado ao finalizar o cadastro."

export async function ensureMembershipStep(params: EnsureMembershipStepParams): OperationResponse<EnsureMembershipStepRes> {
	try {
		const { organizationId, userId, invitedByUserId, mode } = params

		// ------------------------------------------------------------
		// 4) Garantir membership:
		//    - se já é membro -> ok
		//    - se não é -> cria membership (role MEMBER) + invited_by_user_id (se houver)
		// ------------------------------------------------------------
		const membershipCheckRes = await isUserMemberOfOrganizationService({
			organizationId,
			userId
		})

		if (membershipCheckRes.success === false) {
			// se autenticou via signIn e deu erro técnico depois, limpamos sessão
			if (mode === "existing") {
				const signOutRes = await signOutService()
				if (signOutRes.success === false) {
					console.error(`${prefixLog} signOut failed after membership check error:`, signOutRes.message)
				}
			}

			return {
				success: false,
				message: GENERIC_ERROR_MESSAGE
			}
		}

		if (membershipCheckRes.data.isMember === true) {
			return {
				success: true,
				message: "Membership já existe.",
				data: { joinedNow: false }
			}
		}

		const getRoleRes = await getRoleByNameService({
			name: "MEMBER",
			organizationId
		})

		if (getRoleRes.success === false) {
			return getRoleRes
		}

		const roleId = getRoleRes.data.role.id

		const createMembershipRes = await createOrganizationMembershipService({
			organizationId,
			userId,
			roleId,
			invitedByUserId: invitedByUserId ?? undefined
		})

		if (createMembershipRes.success === false) {
			if (mode === "existing") {
				const signOutRes = await signOutService()
				if (signOutRes.success === false) {
					console.error(`${prefixLog} signOut failed after create membership error:`, signOutRes.message)
				}
			}

			return {
				success: false,
				message: GENERIC_ERROR_MESSAGE
			}
		}

		return {
			success: true,
			message: "Membership criada com sucesso.",
			data: { joinedNow: true }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)

		// paranoia: se for existing, tenta signOut também
		if (params.mode === "existing") {
			const signOutRes = await signOutService()
			if (signOutRes.success === false) {
				console.error(`${prefixLog} signOut failed after unexpected error:`, signOutRes.message)
			}
		}

		return {
			success: false,
			message: GENERIC_ERROR_MESSAGE
		}
	}
}
