// @/modules/accounts/onboarding/server/slices/register-and-join/steps/resolve-inviter-by-ref.step.ts

import { getUserIdByInviteCodeService } from "@/modules/accounts/users/server/services/get-user-id-by-invite-code.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"

type ResolveInviterByRefStepParams = {
	organizationId: string
	ref?: string
}

type ResolveInviterByRefStepRes = {
	inviterUserId: string | null
}

type BestEffortOperationResponse<T> = Promise<{
	success: true
	message: string
	data: T
}>

const prefixLog = "[resolveInviterByRefStep]:"

export async function resolveInviterByRefStep(params: ResolveInviterByRefStepParams): BestEffortOperationResponse<ResolveInviterByRefStepRes> {
	try {
		const { organizationId } = params

		// ------------------------------------------------------------
		// 0.1) Validar ref (se existir) e garantir que pertence à org
		//
		// Observação:
		// - Este step NUNCA deve bloquear o cadastro.
		// - Se o ref for inválido/erro técnico, apenas ignora (inviterUserId = null).
		// ------------------------------------------------------------
		const rawRef = (params.ref ?? "").trim().toLowerCase()

		if (rawRef.length === 0) {
			return {
				success: true,
				message: "Sem indicação (ref).",
				data: { inviterUserId: null }
			}
		}

		const inviterRes = await getUserIdByInviteCodeService({ inviteCode: rawRef })
		if (inviterRes.success === false) {
			// best-effort: ignora ref inválido/erro
			console.error(`${prefixLog} getUserIdByInviteCodeService failed:`, inviterRes.message)
			return {
				success: true,
				message: "Indicação ignorada.",
				data: { inviterUserId: null }
			}
		}

		const inviterUserId = inviterRes.data.userId

		const inviterMembershipRes = await isUserMemberOfOrganizationService({
			organizationId,
			userId: inviterUserId
		})

		if (inviterMembershipRes.success === false) {
			// best-effort: falha técnica -> ignora ref
			console.error(`${prefixLog} isUserMemberOfOrganizationService failed:`, inviterMembershipRes.message)
			return {
				success: true,
				message: "Indicação ignorada.",
				data: { inviterUserId: null }
			}
		}

		if (inviterMembershipRes.data.isMember === false) {
			// ref não pertence à org -> ignora
			console.error(`${prefixLog} ref does not belong to this organization`)
			return {
				success: true,
				message: "Indicação ignorada.",
				data: { inviterUserId: null }
			}
		}

		return {
			success: true,
			message: "Indicação resolvida com sucesso.",
			data: { inviterUserId }
		}
	} catch (error) {
		// best-effort total: qualquer exceção vira "ignorar ref"
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: true,
			message: "Indicação ignorada.",
			data: { inviterUserId: null }
		}
	}
}
