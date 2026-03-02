// @/modules/accounts/onboarding/server/slices/register-and-join/steps/sign-up-or-sign-in.step.ts

import { signInService } from "@/modules/auth/server/services/sign-in.service"
import { signUpService } from "@/modules/auth/server/services/sign-up.service"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type SignUpOrSignInStepParams = {
	email: string
	password: string
}

type SignUpOrSignInStepRes = {
	userId: string
	mode: "new" | "existing"
}

const INVALID_SIGNUP_MESSAGE = "Não foi possível concluir o cadastro. Verifique e-mail e senha e tente novamente."
const prefixLog = "[signUpOrSignInStep]:"

export async function signUpOrSignInStep(params: SignUpOrSignInStepParams): OperationResponse<SignUpOrSignInStepRes> {
	try {
		// ------------------------------------------------------------
		// 1) Criar usuário no Auth (ou, se já existir, autenticar)
		// ------------------------------------------------------------
		const signUpRes = await signUpService({
			email: params.email,
			password: params.password
		})

		// Signup OK => usuário novo
		if (signUpRes.success === true) {
			return {
				success: true,
				message: "Usuário criado no Auth com sucesso.",
				data: {
					userId: signUpRes.data.userId,
					mode: "new"
				}
			}
		}

		// Se o e-mail já existe, tentamos entrar (sem vazar informação)
		if (signUpRes.code === "email_exists") {
			const signInRes = await signInService({
				email: params.email,
				password: params.password
			})

			if (signInRes.success === false) {
				// mensagem neutra pra tela de cadastro
				return {
					success: false,
					message: INVALID_SIGNUP_MESSAGE
				}
			}

			return {
				success: true,
				message: "Usuário autenticado com sucesso.",
				data: {
					userId: signInRes.data.userId,
					mode: "existing"
				}
			}
		}

		// Qualquer outro erro do signup (senha fraca etc) mantém o retorno da service
		return signUpRes
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: INVALID_SIGNUP_MESSAGE
		}
	}
}
