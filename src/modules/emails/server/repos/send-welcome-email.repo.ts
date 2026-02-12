// @/modules/emails/server/repos/send-welcome-email.repo.ts

import type { ReactNode } from "react"
import { resendClient } from "@/lib/resend/resend-client"

type SendWelcomeEmailRepoParams = {
	to: string
	subject: string
	react: ReactNode
}

const DEFAULT_FROM_EMAIL = "Gabinete Neo <onboarding@resend.dev>"

export async function sendWelcomeEmailRepo(params: SendWelcomeEmailRepoParams) {
	const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM_EMAIL

	return resendClient.emails.send({
		from,
		to: params.to,
		subject: params.subject,
		react: params.react
	})
}
