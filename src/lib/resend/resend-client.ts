import "server-only"

import { Resend } from "resend"

// Cliente lazy: instanciado só quando alguém de fato tenta enviar um email.
// Se a checagem de RESEND_API_KEY fosse feita no topo do módulo, o simples
// import deste arquivo por qualquer código (mesmo sem nunca chamar
// createResendClient) já derrubaria todo o bundle de Server Actions da
// página em que esse import aparece — Next.js empacota todas as actions de
// uma mesma página juntas, então uma action sem nenhuma relação com email
// (ex: sign-in) poderia falhar só por dividir bundle com uma action que
// importa este módulo.
export function createResendClient() {
	const apiKey = process.env.RESEND_API_KEY

	if (!apiKey) {
		throw new Error("RESEND_API_KEY is not defined in environment variables.")
	}

	return new Resend(apiKey)
}
