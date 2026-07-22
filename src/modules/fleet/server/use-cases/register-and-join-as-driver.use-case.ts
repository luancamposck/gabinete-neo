import { getUserIdByUsernameService } from "@/modules/accounts/users/server/services/get-user-id-by-username.service"
import { createUserService } from "@/modules/auth/server/services/create-user.service"
import { signInService } from "@/modules/auth/server/services/sign-in.service"
import { sendWelcomeEmailService } from "@/modules/emails/server/services/send-welcome-email.service"
import type { RegisterAndJoinAsDriverUseCaseCodes, RegisterAndJoinAsDriverUseCaseData, RegisterAndJoinAsDriverUseCaseParams } from "@/modules/fleet/shared/types/slices/register-and-join-as-driver.types"
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
import { checkPendingDriverApplicationService } from "../services/check-pending-driver-application.service"
import { checkPlateAvailableService } from "../services/check-plate-available.service"
import { createDriverApplicationService } from "../services/create-driver-application.service"
import { deleteDriverDocumentsService } from "../services/delete-driver-documents.service"
import { uploadDriverDocumentService } from "../services/upload-driver-document.service"

const prefixLog = "[registerAndJoinAsDriverUseCase]:"

export async function registerAndJoinAsDriverUseCase(params: RegisterAndJoinAsDriverUseCaseParams): AppResultAsync<RegisterAndJoinAsDriverUseCaseData, RegisterAndJoinAsDriverUseCaseCodes> {
	// ============================================================
	// 1) Resolver a organização pelo domínio atual (app_domain)
	//
	// Possibilidades:
	// - Host ausente: não dá pra identificar a organização, falha com
	//   "org_not_found".
	// - app_domain sem organização: "org_not_found".
	// - Erro técnico no lookup: vira "generic_error"; a service mantém
	//   o detalhe técnico restrito ao log do servidor.
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
	// - invited_by_user_id só pode ser preenchido quando a membership é
	//   criada; resolver depois perderia esse vínculo.
	//
	// Possibilidades:
	// - Sem ref, ref inválida, inviter fora da organização ou falha de
	//   infraestrutura: inviterUserId permanece null.
	// - Nenhuma falha deste bloco interrompe o cadastro do motorista.
	// ============================================================
	let inviterUserId: string | null = null
	const rawRef = (params.ref ?? "").trim().toLowerCase()

	if (rawRef.length > 0) {
		const inviterLookupRes = await getUserIdByUsernameService({ username: rawRef })

		if (inviterLookupRes.success === false) {
			console.error(`${prefixLog} failed to resolve inviter`)
		} else {
			const inviterMembershipRes = await isUserMemberOfOrganizationService({
				organizationId,
				userId: inviterLookupRes.data.userId
			})

			if (inviterMembershipRes.success === false) {
				console.error(`${prefixLog} failed to validate inviter membership`)
			} else if (inviterMembershipRes.data.isMember === true) {
				inviterUserId = inviterLookupRes.data.userId
			}
		}
	}

	// ============================================================
	// 3) Descobrir se o email já pertence a uma conta (novo vs existente)
	//
	// Por quê antes dos pré-checks de username/phone:
	// - Uma pessoa com conta existente pode reenviar os próprios dados.
	//   Checar username/phone primeiro bloquearia esse caminho com
	//   "username_taken"/"phone_taken" antes do sign-in.
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
		// - Sucesso: reutiliza a conta e mantém a sessão estabelecida.
		// - Falha: retorna "invalid_signup" sem revelar se o problema é o
		//   email existente ou apenas a senha incorreta.
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
		// 4b) [new] Pré-checks + criação atômica + sessão
		//
		// Os pré-checks preservam codes específicos antes de chamar a API
		// Admin, que devolveria um erro opaco se a trigger encontrasse uma
		// violação de username/phone.
		//
		// createUserService cria auth.users + public.users +
		// public.user_profiles atomicamente pela trigger. Por isso não há
		// rollback manual do auth user neste use-case.
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

		// createUserService só cria a conta; o sign-in explícito garante
		// que o redirect pós-cadastro encontre uma sessão válida.
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
	// - Já é membro: pula a criação e joinedNow permanece false.
	// - Ainda não é membro: resolve a role MEMBER e cria o vínculo com o
	//   inviter válido, quando houver.
	// - Qualquer falha mantém conta e sessão intactas. A política é nunca
	//   deslogar nem apagar o usuário por uma falha de membership; o
	//   dashboard-guard trata quem ainda ficou sem vínculo.
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
			organizationId,
			name: "MEMBER"
		})

		if (roleRes.success === false) {
			return {
				success: false,
				code: roleRes.code === "role_not_found" || roleRes.code === "role_inactive" ? roleRes.code : "generic_error"
			}
		}

		const membershipRes = await createOrganizationMembershipService({
			organizationId,
			userId,
			roleId: roleRes.data.role.id,
			invitedByUserId: inviterUserId ?? undefined
		})

		if (membershipRes.success === false) {
			return {
				success: false,
				code: "generic_error"
			}
		}

		joinedNow = true
	}

	// ============================================================
	// 6) Validar placa e candidatura pendente antes dos uploads
	//
	// Por quê antes do Storage:
	// - Uma placa ativa ou candidatura pending já torna a operação
	//   inválida; subir arquivos antes criaria documentos desnecessários.
	// - Os gates fornecem "plate_taken" e "pending_application_exists".
	//   Uma corrida que ultrapasse o gate vira "generic_error" no insert,
	//   protegida também pelas constraints do banco.
	// ============================================================
	const plateRes = await checkPlateAvailableService({
		organizationId,
		plate: params.plate
	})
	if (plateRes.success === false) return plateRes

	const pendingRes = await checkPendingDriverApplicationService({
		organizationId,
		userId
	})
	if (pendingRes.success === false) return pendingRes

	// ============================================================
	// 7) Subir CRLV e CNH individualmente
	//
	// Possibilidades:
	// - Falha no CRLV: ainda não há arquivo para compensar.
	// - Falha na CNH: remove o CRLV já enviado antes de retornar.
	// - MIME e tamanho já foram validados pelo Zod na Action; a service
	//   singular se limita a enviar um arquivo por chamada.
	// ============================================================
	const crlvUploadRes = await uploadDriverDocumentService({
		organizationId,
		userId,
		file: params.crlv
	})
	if (crlvUploadRes.success === false) return crlvUploadRes

	const cnhUploadRes = await uploadDriverDocumentService({
		organizationId,
		userId,
		file: params.cnh
	})

	if (cnhUploadRes.success === false) {
		const cleanupRes = await deleteDriverDocumentsService({
			paths: [crlvUploadRes.data.path]
		})

		if (cleanupRes.success === false) {
			console.error(`${prefixLog} failed to cleanup CRLV after CNH upload failure`)
		}

		return cnhUploadRes
	}

	// ============================================================
	// 8) Criar a candidatura pending com insert em tabela única
	//
	// Possibilidades:
	// - Sucesso: applicationId identifica a candidatura criada.
	// - Falha: CRLV e CNH já estão no Storage; remove ambos para evitar
	//   arquivos órfãos e propaga o code estável da service.
	//
	// Não há RPC nem rollback de auth/membership neste ponto. Apenas os
	// documentos recém-enviados são compensados.
	// ============================================================
	const applicationRes = await createDriverApplicationService({
		organizationId,
		userId,
		plate: params.plate,
		vehicleType: params.vehicleType,
		vehicleModel: params.vehicleModel,
		vehicleYear: params.vehicleYear,
		vehicleColor: params.vehicleColor,
		crlvDocumentPath: crlvUploadRes.data.path,
		cnhDocumentPath: cnhUploadRes.data.path
	})

	if (applicationRes.success === false) {
		const cleanupRes = await deleteDriverDocumentsService({
			paths: [crlvUploadRes.data.path, cnhUploadRes.data.path]
		})

		if (cleanupRes.success === false) {
			console.error(`${prefixLog} failed to cleanup documents after application creation failure`)
		}

		return applicationRes
	}

	// ============================================================
	// 9) Enviar boas-vindas ao entrar na organização (best-effort)
	//
	// Regras:
	// - Só envia se a membership foi criada agora (joinedNow = true).
	// - Falha ao buscar a organização permite envio sem nome.
	// - Falha de email não desfaz conta, membership ou candidatura.
	// ============================================================
	if (joinedNow) {
		const organizationRes = await getOrganizationByIdService({ organizationId })
		const organizationName = organizationRes.success ? organizationRes.data.organization.name : null

		const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1")
		const protocol = isLocalHost ? "http" : "https"
		const dashboardUrl = `${protocol}://${host}/dashboard`

		const welcomeRes = await sendWelcomeEmailService({
			to: params.email,
			userName: params.name,
			organizationName,
			dashboardUrl
		})

		if (welcomeRes.success === false) {
			console.error(`${prefixLog} failed to send welcome email`)
		}
	}

	// ============================================================
	// 10) Registrar referral (best-effort)
	//
	// Regras:
	// - Exige inviter válido e membership criada nesta execução.
	// - Nunca registra auto-referral.
	// - Falha não desfaz nenhuma operação concluída anteriormente.
	// ============================================================
	if (inviterUserId && joinedNow && inviterUserId !== userId) {
		const referralRes = await createOrganizationReferralService({
			organizationId,
			inviterUserId,
			invitedUserId: userId,
			relationshipToInviter: params.relationshipToInviter ?? null
		})

		if (referralRes.success === false) {
			console.error(`${prefixLog} failed to record referral`)
		}
	}

	return {
		success: true,
		data: {
			organizationId,
			userId,
			applicationId: applicationRes.data.applicationId
		}
	}
}
