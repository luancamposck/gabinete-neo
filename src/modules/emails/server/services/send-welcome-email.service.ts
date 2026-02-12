// @/modules/emails/server/services/send-welcome-email.service.ts

import { sendWelcomeEmailSchema } from "@/lib/validations/emails/send-welcome-email.schema"
import { sendWelcomeEmailRepo } from "@/modules/emails/server/repos/send-welcome-email.repo"
import { WelcomeEmailTemplate } from "@/modules/emails/shared/templates/welcome-email.template"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type SendWelcomeEmailServiceParams = {
	to: string
	userName?: string | null
	organizationName?: string | null
	dashboardUrl?: string | null
}

type SendWelcomeEmailServiceRes = {
	emailId: string
}

type ErrorCodes = "invalid_email" | "infra_error"

const prefixLog = "[sendWelcomeEmailService]:"
const INVALID_EMAIL_ERROR = "Informe um email válido para enviar as boas-vindas."
const SEND_ERROR = "Não foi possível enviar o email de boas-vindas. Tente novamente mais tarde."
const SEND_SUCCESS = "Email de boas-vindas enviado com sucesso."
const APP_NAME = "Gabinete Neo"

export async function sendWelcomeEmailService(params: SendWelcomeEmailServiceParams): OperationResponse<SendWelcomeEmailServiceRes, ErrorCodes> {
	try {
		const normalizedEmail = params.to.trim().toLowerCase()

		const parsed = sendWelcomeEmailSchema.safeParse({
			to: normalizedEmail
		})

		if (!parsed.success) {
			return {
				success: false,
				message: parsed.error.issues[0]?.message ?? INVALID_EMAIL_ERROR,
				code: "invalid_email"
			}
		}

		const normalizedName = params.userName?.trim() ?? ""
		const normalizedOrganizationName = params.organizationName?.trim() ?? ""
		const normalizedDashboardUrl = params.dashboardUrl?.trim() ?? ""
		const dashboardUrl = normalizedDashboardUrl.length > 0 ? normalizedDashboardUrl : undefined

		const greeting = normalizedName ? `Olá, ${normalizedName}!` : "Olá!"
		const title = normalizedOrganizationName ? `Bem-vindo(a) à ${normalizedOrganizationName}` : `Bem-vindo(a) ao ${APP_NAME}`
		const subject = normalizedOrganizationName ? `Boas-vindas à ${normalizedOrganizationName} no ${APP_NAME}` : `Boas-vindas ao ${APP_NAME}`

		const { data, error } = await sendWelcomeEmailRepo({
			to: parsed.data.to,
			subject,
			react: WelcomeEmailTemplate({ greeting, title, dashboardUrl })
		})

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: SEND_ERROR,
				code: "infra_error"
			}
		}

		if (!data?.id) {
			console.error(`${prefixLog} missing email id in resend response`)
			return {
				success: false,
				message: SEND_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: SEND_SUCCESS,
			data: {
				emailId: data.id
			}
		}
	} catch (error) {
		rethrowIfNextError(error)
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: SEND_ERROR,
			code: "infra_error"
		}
	}
}
