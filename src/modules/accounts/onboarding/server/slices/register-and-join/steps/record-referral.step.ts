// @/modules/accounts/onboarding/server/slices/register-and-join/steps/record-referral.step.ts

import { createOrganizationReferralService } from "@/modules/organizations/referrals/server/services/create-referral.service"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RecordReferralStepParams = {
	organizationId: string
	inviterUserId: string | null
	invitedUserId: string
	relationshipToInviter?: string | null
	joinedNow: boolean
}

type RecordReferralStepRes = {
	recorded: boolean
}

const prefixLog = "[recordReferralStep]:"

export async function recordReferralStep(params: RecordReferralStepParams): OperationResponse<RecordReferralStepRes> {
	try {
		// ------------------------------------------------------------
		// 5) Registrar referral (se houver ref)
		//
		// Regras:
		// - Só registra se inviter existir
		// - Só registra se houve JOIN agora (joinedNow === true)
		// - Não deve quebrar o cadastro se falhar (best-effort)
		// ------------------------------------------------------------
		if (!params.inviterUserId) {
			return {
				success: true,
				message: "Sem indicação para registrar.",
				data: { recorded: false }
			}
		}

		if (params.joinedNow === false) {
			return {
				success: true,
				message: "Usuário já era membro. Não registra referral novamente.",
				data: { recorded: false }
			}
		}

		// evita auto-referral por acidente
		if (params.inviterUserId === params.invitedUserId) {
			console.error(`${prefixLog} inviterUserId equals invitedUserId (ignoring)`)
			return {
				success: true,
				message: "Indicação ignorada.",
				data: { recorded: false }
			}
		}

		const referralRes = await createOrganizationReferralService({
			organizationId: params.organizationId,
			inviterUserId: params.inviterUserId,
			invitedUserId: params.invitedUserId,
			relationshipToInviter: params.relationshipToInviter ?? null
		})

		if (referralRes.success === false) {
			// best-effort: loga e segue como sucesso
			console.error(`${prefixLog} referral failed:`, referralRes.message)
			return {
				success: true,
				message: "Não foi possível registrar a indicação (ignorado).",
				data: { recorded: false }
			}
		}

		return {
			success: true,
			message: "Indicação registrada com sucesso.",
			data: { recorded: true }
		}
	} catch (error) {
		// best-effort total
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: true,
			message: "Não foi possível registrar a indicação (ignorado).",
			data: { recorded: false }
		}
	}
}
