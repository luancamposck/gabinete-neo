// @/modules/onboarding/server/use-cases/register-and-join.use-case.ts

import { getUserIdByUsernameService } from "@/modules/accounts/users/server/services/get-user-id-by-username.service"
import { createUserService } from "@/modules/auth/server/services/create-user.service"
import { signInService } from "@/modules/auth/server/services/sign-in.service"
import { sendWelcomeEmailService } from "@/modules/emails/server/services/send-welcome-email.service"
import { createOrganizationMembershipService } from "@/modules/organizations/memberships/server/services/create-membership.service"
import { getRoleByNameService } from "@/modules/organizations/memberships/server/services/get-role-by-name.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { createOrganizationReferralService } from "@/modules/organizations/referrals/server/services/create-referral.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { checkPhoneAvailableService } from "@/modules/users/profiles/server/services/check-phone-available.service"
import { checkUsernameAvailableService } from "@/modules/users/server/services/check-username-available.service"
import { lookupUserIdByEmailService } from "@/modules/users/server/services/lookup-user-id-by-email.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { RegisterAndJoinUseCaseCodes, RegisterAndJoinUseCaseData, RegisterAndJoinUseCaseParams } from "../../shared/types/slices/register-and-join.types"

const prefixLog = "[registerAndJoinUseCase]:"

export async function registerAndJoinUseCase(params: RegisterAndJoinUseCaseParams): AppResultAsync<RegisterAndJoinUseCaseData, RegisterAndJoinUseCaseCodes> {
	// ============================================================
	// 1) Resolver a organização pelo domínio atual (app_domain)
	//
	// Possibilidades:
	// - Host ausente: não dá pra saber a organização, falha imediata.
	// - app_domain sem organização: "org_not_found".
	// - Erro técnico no lookup: vira "generic_error" (a service já loga
	//   a causa específica).
	// ============================================================
	const host = await getRequestHost()

	if (!host) {
		console.error(`${prefixLog} missing request host`)
		return {
			success: false,
			code: "org_not_found"
		}
	}

	const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })

	if (orgRes.success === false) {
		return {
			success: false,
			code: orgRes.code === "infra_error" ? "generic_error" : "org_not_found"
		}
	}

	const organizationId = orgRes.data.organizationId

	// ============================================================
	// 2) Resolver inviter por ref (best-effort)
	//
	// Por quê antes da membership:
	// - membership.invited_by_user_id só é preenchido na criação; se
	//   resolvêssemos o ref depois, esse campo nunca seria populado
	//   (é lido direto, sem fallback, em get-my-account-data.action.ts).
	//
	// Possibilidades:
	// - Sem ref, ref inválida, inviter não pertence à org, ou erro
	//   técnico: inviterUserId fica null e o cadastro NUNCA é bloqueado
	//   por causa disso.
	// ============================================================
	let inviterUserId: string | null = null
	const rawRef = (params.ref ?? "").trim().toLowerCase()

	if (rawRef.length > 0) {
		const inviterLookupRes = await getUserIdByUsernameService({ username: rawRef })

		if (inviterLookupRes.success === false) {
			console.error(`${prefixLog} getUserIdByUsernameService failed while resolving inviter:`, inviterLookupRes.message)
		} else {
			const inviterMembershipRes = await isUserMemberOfOrganizationService({
				organizationId,
				userId: inviterLookupRes.data.userId
			})

			if (inviterMembershipRes.success === false) {
				console.error(`${prefixLog} isUserMemberOfOrganizationService failed while resolving inviter:`, inviterMembershipRes.message)
			} else if (inviterMembershipRes.data.isMember === true) {
				inviterUserId = inviterLookupRes.data.userId
			}
		}
	}

	// ============================================================
	// 3) Descobrir se o email já pertence a uma conta (novo vs existente)
	//
	// Por quê antes dos pré-checks de username/phone:
	// - Se checássemos username/phone antes de saber se o email já é de
	//   um usuário existente, alguém reabrindo o formulário com os
	//   PRÓPRIOS dados seria bloqueado com "username_taken"/"phone_taken"
	//   antes de nunca chegar no caminho de sign-in.
	// ============================================================
	const emailLookupRes = await lookupUserIdByEmailService({ email: params.email })

	if (emailLookupRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	let userId: string

	if (emailLookupRes.data.userId) {
		// ============================================================
		// 4a) [existing] Autenticar com email + senha
		//
		// Possibilidades:
		// - Sucesso: userId da conta já existente, sessão estabelecida.
		// - Falha: mensagem neutra ("invalid_signup"), sem vazar se o
		//   email existe ou se foi só a senha que errou.
		// ============================================================
		const signInRes = await signInService({
			email: params.email,
			password: params.password
		})

		if (signInRes.success === false) {
			return {
				success: false,
				code: "invalid_signup"
			}
		}

		userId = signInRes.data.userId
	} else {
		// ============================================================
		// 4b) [new] Pré-checks de disponibilidade + criação atômica
		//
		// Pré-checks ANTES de admin.createUser(): se a violação de
		// unicidade só fosse pega pela trigger do banco, a Auth Admin
		// API devolve um erro opaco, perdendo o code específico.
		//
		// createUserService cria auth.users + public.users +
		// public.user_profiles atomicamente via trigger — nenhum
		// rollback manual é necessário aqui.
		// ============================================================
		const usernameRes = await checkUsernameAvailableService({ username: params.username })
		if (usernameRes.success === false) return usernameRes

		const phoneRes = await checkPhoneAvailableService({ phone: params.phone })
		if (phoneRes.success === false) return phoneRes

		const createRes = await createUserService({
			email: params.email,
			password: params.password,
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
		if (createRes.success === false) return createRes

		// Estabelece a sessão do usuário recém-criado: createUserService
		// apenas cria a conta (não loga). Sem isso, o redirect pós-cadastro
		// para /dashboard cairia num usuário sem sessão e quicaria pro login.
		const signInRes = await signInService({
			email: params.email,
			password: params.password
		})
		if (signInRes.success === false) {
			return {
				success: false,
				code: "invalid_signup"
			}
		}

		userId = createRes.data.userId
	}

	// ============================================================
	// 5) Garantir membership na organização atual
	//
	// Possibilidades:
	// - Já é membro: joinedNow = false, não mexe em nada.
	// - Não é: cria membership (role MEMBER) com invited_by_user_id.
	// - Falha técnica em qualquer ponto daqui: o usuário NUNCA é deslogado
	//   (política "nunca deslogar") nem tem a conta apagada. A conta/sessão
	//   foram criadas com sucesso, só a entrada nesta organização falhou; o
	//   dashboard-guard redireciona quem ficou sem membership, e a tentativa
	//   pode ser refeita depois.
	// ============================================================
	const membershipCheckRes = await isUserMemberOfOrganizationService({
		organizationId,
		userId
	})

	if (membershipCheckRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	let joinedNow: boolean = false

	if (membershipCheckRes.data.isMember === false) {
		const roleRes = await getRoleByNameService({
			name: "MEMBER",
			organizationId
		})

		if (roleRes.success === false) {
			return {
				success: false,
				code: roleRes.code === "role_not_found" || roleRes.code === "role_inactive" ? roleRes.code : "generic_error"
			}
		}

		const createMembershipRes = await createOrganizationMembershipService({
			organizationId,
			userId,
			roleId: roleRes.data.role.id,
			invitedByUserId: inviterUserId ?? undefined
		})

		if (createMembershipRes.success === false) {
			return {
				success: false,
				code: "generic_error"
			}
		}

		joinedNow = true
	}

	// ============================================================
	// 6) Enviar boas-vindas ao entrar na organização (best-effort)
	//
	// Regras:
	// - Só envia quando de fato entrou agora (joinedNow = true).
	// - Falha de envio NÃO bloqueia o cadastro.
	// ============================================================
	if (joinedNow) {
		const organizationRes = await getOrganizationByIdService({ organizationId })
		const organizationName = organizationRes.success ? organizationRes.data.organization.name : null

		const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1")
		const protocol = isLocalHost ? "http" : "https"
		const dashboardUrl = `${protocol}://${host}/dashboard`

		const sendWelcomeRes = await sendWelcomeEmailService({
			to: params.email,
			userName: params.name,
			organizationName,
			dashboardUrl
		})

		if (sendWelcomeRes.success === false) {
			console.error(`${prefixLog} failed to send welcome email: ${sendWelcomeRes.message}`)
		}
	}

	// ============================================================
	// 7) Registrar referral (best-effort)
	//
	// Regras:
	// - Só registra se houver inviter válido e houve JOIN agora.
	// - Nunca registra auto-referral (inviter === o próprio usuário).
	// - Falha não desfaz membership/conta já criadas.
	// ============================================================
	if (inviterUserId && joinedNow && inviterUserId !== userId) {
		const referralRes = await createOrganizationReferralService({
			organizationId,
			inviterUserId,
			invitedUserId: userId,
			relationshipToInviter: params.relationshipToInviter ?? null
		})

		if (referralRes.success === false) {
			console.error(`${prefixLog} failed to record referral:`, referralRes.message)
		}
	}

	return {
		success: true,
		data: {
			userId,
			organizationId
		}
	}
}
