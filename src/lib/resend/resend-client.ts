import "server-only"

import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
	throw new Error("RESEND_API_KEY is not defined in environment variables.")
}

export const resendClient = new Resend(apiKey)
