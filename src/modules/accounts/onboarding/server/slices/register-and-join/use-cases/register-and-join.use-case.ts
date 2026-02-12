// @/modules/accounts/onboarding/server/slices/register-and-join/use-cases/register-and-join.use-case.ts

import { createPublicUserAndProfileStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/create-public-user-and-profile.step"
import { ensureMembershipStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/ensure-membership.step"
import { recordReferralStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/record-referral.step"
import { resolveInviterByRefStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/resolve-inviter-by-ref.step"
import { resolveOrganizationIdByHostStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/resolve-organization-id-by-host.step"
import { signUpOrSignInStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/sign-up-or-sign-in.step"
import type { RegisterAndJoinParams } from "@/modules/accounts/onboarding/shared/types/inputs"
import { sendWelcomeEmailService } from "@/modules/emails/server/services/send-welcome-email.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RegisterAndJoinUseCaseRes = {
	organizationId: string
	userId: string
}

const prefixLog = "[registerAndJoinUseCase]:"
const SUCCESS_MESSAGE = "Cadastro concluído com sucesso."
const GENERIC_ERROR_MESSAGE = "Erro inesperado ao finalizar o cadastro."

function buildDashboardUrl(host: string): string {
	const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1")
	const protocol = isLocalHost ? "http" : "https"
	return `${protocol}://${host}/dashboard`
}

export async function registerAndJoinUseCase(params: RegisterAndJoinParams): OperationResponse<RegisterAndJoinUseCaseRes> {
	try {
		// ============================================================
		// 0) Descobrir a organização pelo domínio atual (app_domain)
		//
		// Possibilidades:
		// - Host ausente: falha imediata (não dá pra saber a org).
		// - app_domain não encontrado: service retorna erro.
		// - Sucesso: temos organizationId e seguimos.
		// ============================================================
		const orgStepRes = await resolveOrganizationIdByHostStep()
		if (orgStepRes.success === false) return orgStepRes

		const { host, organizationId } = orgStepRes.data

		// ============================================================
		// 0.1) Resolver ref (best-effort)
		//
		// Possibilidades:
		// - Sem ref: inviterUserId = null (segue normal).
		// - Ref inválida / inviter não pertence à org / erro técnico:
		//   -> inviterUserId = null (NÃO bloqueia cadastro).
		// - Ref válida: inviterUserId preenchido.
		// ============================================================
		const inviterStepRes = await resolveInviterByRefStep({
			organizationId,
			ref: params.ref
		})

		// Esse step sempre retorna success:true (best-effort).
		const inviterUserId = inviterStepRes.data.inviterUserId

		// ============================================================
		// 1) SignUp OU SignIn (quando email já existe)
		//
		// Possibilidades:
		// - SignUp OK: mode = "new" (usuário novo no Auth).
		// - Email já existe: tenta SignIn:
		//   - SignIn OK: mode = "existing" (usuário já existia).
		//   - SignIn falha: retorna mensagem neutra (sem vazar se email existe).
		// - Outro erro de signUp (senha fraca etc): retorna o erro da service.
		// ============================================================
		const authStepRes = await signUpOrSignInStep({
			email: params.email,
			password: params.password
		})
		if (authStepRes.success === false) return authStepRes

		const { userId, mode } = authStepRes.data

		// ============================================================
		// 2 + 3) (Somente usuário novo) Criar public.users + user_profiles
		//
		// Possibilidades:
		// - Se mode === "new": cria public.users e user_profiles.
		//   - Se falhar: faz rollback deletando auth.user (deleteAuthUserService).
		// - Se mode === "existing": NÃO encosta em public.users/profile
		//   (evita sobrescrever dados de alguém que já tem conta).
		// ============================================================
		if (mode === "new") {
			const createPublicRes = await createPublicUserAndProfileStep({
				userId,
				email: params.email,
				name: params.name,
				username: params.username,

				phone: params.phone,
				cep: params.cep,
				state: params.state,
				city: params.city,
				neighborhood: params.neighborhood,
				street: params.street,
				number: params.number,
				complement: params.complement
			})

			if (createPublicRes.success === false) return createPublicRes
		}

		// ============================================================
		// 4) Garantir membership na org atual
		//
		// Possibilidades:
		// - Usuário já é membro: joinedNow = false (não cria referral de novo).
		// - Usuário não é membro: cria membership agora:
		//   - joinedNow = true
		//   - membership recebe invitedByUserId se ref era válida
		// - Se erro técnico:
		//   - mode === "existing": step tenta signOut (pra não ficar logado “no lugar errado”)
		//   - retorna falha genérica do fluxo
		// ============================================================
		const membershipStepRes = await ensureMembershipStep({
			organizationId,
			userId,
			invitedByUserId: inviterUserId,
			mode
		})
		if (membershipStepRes.success === false) return membershipStepRes

		const { joinedNow } = membershipStepRes.data

		// ============================================================
		// 4.1) Enviar boas-vindas ao entrar na organização (best-effort)
		//
		// Regras:
		// - Só envia quando de fato entrou agora (joinedNow = true).
		// - Falha de envio NÃO bloqueia o fluxo principal de cadastro.
		// ============================================================
		if (joinedNow) {
			const organizationRes = await getOrganizationByIdService({ organizationId })
			const organizationName = organizationRes.success ? organizationRes.data.organization.name : null

			const sendWelcomeRes = await sendWelcomeEmailService({
				to: params.email,
				userName: params.name,
				organizationName,
				dashboardUrl: buildDashboardUrl(host)
			})

			if (sendWelcomeRes.success === false) {
				console.error(`${prefixLog} failed to send welcome email: ${sendWelcomeRes.message}`)
			}
		}

		// ============================================================
		// 5) Registrar referral (best-effort)
		//
		// Regras:
		// - Só registra se:
		//   - inviterUserId existe (ref foi válida)
		//   - joinedNow === true (evita duplicar referral ao abrir link de novo)
		// - Se falhar, NÃO quebra o cadastro.
		// ============================================================
		await recordReferralStep({
			organizationId,
			inviterUserId,
			invitedUserId: userId,
			relationshipToInviter: params.relationshipToInviter ?? null,
			joinedNow
		})

		// ============================================================
		// Final
		// - Independente de ter sido "new" ou "existing",
		//   e independente do referral ter sido registrado,
		//   o resultado de sucesso é o mesmo.
		// ============================================================
		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: { userId, organizationId }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return { success: false, message: GENERIC_ERROR_MESSAGE }
	}
}
