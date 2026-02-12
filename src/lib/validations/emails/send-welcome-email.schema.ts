import { z } from "zod"

export const sendWelcomeEmailSchema = z.object({
	to: z.email("Informe um email válido para enviar as boas-vindas.")
})

export type SendWelcomeEmailSchema = z.infer<typeof sendWelcomeEmailSchema>
