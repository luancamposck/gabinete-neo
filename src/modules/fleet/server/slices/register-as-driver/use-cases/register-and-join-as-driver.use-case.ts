// @/modules/fleet/server/slices/register-as-driver/use-cases/register-and-join-as-driver.use-case.ts

import { createPublicUserAndProfileStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/create-public-user-and-profile.step"
import { recordReferralStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/record-referral.step"
import { resolveInviterByRefStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/resolve-inviter-by-ref.step"
import { resolveOrganizationIdByHostStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/resolve-organization-id-by-host.step"
import { signUpOrSignInStep } from "@/modules/accounts/onboarding/server/slices/register-and-join/steps/sign-up-or-sign-in.step"
import { deleteAuthUserService } from "@/modules/auth/server/services/delete-auth-user.service"
import { sendWelcomeEmailService } from "@/modules/emails/server/services/send-welcome-email.service"
import { deleteDriverDocumentsService } from "@/modules/fleet/server/services/delete-driver-documents.service"
import { createDriverApplicationStep } from "@/modules/fleet/server/slices/register-as-driver/steps/create-driver-application.step"
import { uploadDriverDocumentsStep } from "@/modules/fleet/server/slices/register-as-driver/steps/upload-driver-documents.step"
import type { RegisterAsDriverParams } from "@/modules/fleet/shared/types/inputs"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type RegisterAndJoinAsDriverUseCaseRes = {
	organizationId: string
	userId: string
	applicationId: string
}

type ErrorCodes = "invalid_file" | "org_not_found" | "plate_taken" | "application_pending_exists" | "infra_error"

const MSG_SUCCESS = "Cadastro de motorista concluído com sucesso. Sua candidatura está em análise."
const MSG_INFRA_ERROR = "Não foi possível finalizar o cadastro de motorista. Tente novamente mais tarde."
const prefixLog = "[registerAndJoinAsDriverUseCase]:"

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const

function toFailureResponse(response: { message: string; code?: string }): { success: false; message: string; code?: ErrorCodes } {
	switch (response.code) {
		case "invalid_file":
		case "org_not_found":
		case "plate_taken":
		case "application_pending_exists":
		case "infra_error":
			return {
				success: false,
				message: response.message,
				code: response.code
			}
		default:
			return {
				success: false,
				message: response.message
			}
	}
}

function buildDashboardUrl(host: string): string {
	const isLocalHost = host.includes("localhost") || host.startsWith("127.0.0.1")
	const protocol = isLocalHost ? "http" : "https"
	return `${protocol}://${host}/dashboard`
}

async function rollbackAuthUserIfNew(params: { userId: string; mode: "new" | "existing" }) {
	if (params.mode !== "new") return

	const deleteAuthUserRes = await deleteAuthUserService({ userId: params.userId })
	if (deleteAuthUserRes.success === false) {
		console.error(`${prefixLog} failed to rollback auth user: ${deleteAuthUserRes.message}`)
	}
}

async function cleanupUploadedDocuments(paths: string[]) {
	const cleanupRes = await deleteDriverDocumentsService({ paths })
	if (cleanupRes.success === false) {
		console.error(`${prefixLog} failed to cleanup uploaded documents: ${cleanupRes.message}`)
	}
}

export async function registerAndJoinAsDriverUseCase(params: RegisterAsDriverParams): OperationResponse<RegisterAndJoinAsDriverUseCaseRes, ErrorCodes> {
	let authUserForRollback: { userId: string; mode: "new" | "existing" } | null = null
	let uploadedDocumentPaths: string[] = []

	try {
		// ============================================================
		// 0) Descobrir a organização pelo domínio atual (app_domain)
		//
		// Possibilidades:
		// - Host ausente ou organização inexistente: falha imediata.
		// - Sucesso: temos `organizationId` e o host para links.
		// ============================================================
		const orgStepRes = await resolveOrganizationIdByHostStep()
		if (orgStepRes.success === false) return toFailureResponse(orgStepRes)

		const { host, organizationId } = orgStepRes.data

		// ============================================================
		// 1) Resolver ref (best-effort)
		//
		// Possibilidades:
		// - Sem ref ou ref inválida: segue com `inviterUserId = null`.
		// - Ref válida: passa `inviterUserId` para a RPC de membership.
		// ============================================================
		const inviterStepRes = await resolveInviterByRefStep({
			organizationId,
			ref: params.ref
		})
		const inviterUserId = inviterStepRes.data.inviterUserId

		// ============================================================
		// 2) SignUp OU SignIn
		//
		// Possibilidades:
		// - Usuário novo no Auth: `mode = "new"`.
		// - Email existente + senha válida: `mode = "existing"`.
		// - Email existente + senha inválida: mensagem neutra do step.
		// ============================================================
		const authStepRes = await signUpOrSignInStep({
			email: params.email,
			password: params.password
		})
		if (authStepRes.success === false) return toFailureResponse(authStepRes)

		const { userId, mode } = authStepRes.data
		authUserForRollback = { userId, mode }

		// ============================================================
		// 3) Criar public.users + user_profiles para usuário novo
		//
		// Possibilidades:
		// - `mode === "new"`: cria dados públicos e perfil.
		// - Falha nesse step: o próprio step remove o auth user.
		// - `mode === "existing"`: não altera dados públicos existentes.
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

			if (createPublicRes.success === false) return toFailureResponse(createPublicRes)
		}

		// ============================================================
		// 4) Upload de CRLV e CNH no Storage privado
		//
		// Possibilidades:
		// - Sucesso: temos paths privados para a RPC.
		// - Falha parcial: o service de upload limpa paths já enviados.
		// - Se usuário era novo, removemos auth user como compensação.
		// ============================================================
		const uploadStepRes = await uploadDriverDocumentsStep({
			organizationId,
			userId,
			crlv: params.crlv,
			cnh: params.cnh
		})

		if (uploadStepRes.success === false) {
			await rollbackAuthUserIfNew({ userId, mode })
			return uploadStepRes
		}

		const { crlvPath, cnhPath } = uploadStepRes.data
		uploadedDocumentPaths = [crlvPath, cnhPath]

		// ============================================================
		// 5) Criar membership + driver_application via RPC
		//
		// Possibilidades:
		// - Sucesso: retorna `applicationId` e `joinedNow`.
		// - Placa tomada ou candidatura pendente: retorna erro de domínio.
		// - Qualquer falha após upload: remove documentos e, se novo, auth user.
		// ============================================================
		const applicationStepRes = await createDriverApplicationStep({
			organizationId,
			userId,
			plate: params.plate,
			vehicleType: params.vehicleType,
			vehicleModel: params.vehicleModel ?? null,
			vehicleYear: params.vehicleYear ?? null,
			vehicleColor: params.vehicleColor ?? null,
			crlvPath,
			cnhPath,
			invitedByUserId: inviterUserId
		})

		if (applicationStepRes.success === false) {
			await cleanupUploadedDocuments([crlvPath, cnhPath])
			await rollbackAuthUserIfNew({ userId, mode })
			return applicationStepRes
		}

		const { applicationId, joinedNow } = applicationStepRes.data

		// ============================================================
		// 6) Enviar boas-vindas ao entrar na organização (best-effort)
		//
		// Regras:
		// - Só envia quando a RPC informou `joinedNow`.
		// - Falha de email não bloqueia candidatura criada.
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
		// 7) Registrar referral (best-effort)
		//
		// Regras:
		// - O step registra somente quando há inviter válido e `joinedNow`.
		// - Falha nunca desfaz membership/candidatura já criadas.
		// ============================================================
		await recordReferralStep({
			organizationId,
			inviterUserId,
			invitedUserId: userId,
			relationshipToInviter: params.relationshipToInviter ?? null,
			joinedNow
		})

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				organizationId,
				userId,
				applicationId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)

		if (uploadedDocumentPaths.length > 0) {
			await cleanupUploadedDocuments(uploadedDocumentPaths)
		}

		if (authUserForRollback) {
			await rollbackAuthUserIfNew(authUserForRollback)
		}

		return FALLBACK_INFRA_ERROR
	}
}
