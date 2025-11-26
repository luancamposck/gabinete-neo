import { z } from "zod"

export const signInSchema = z.object({
	email: z.email("Informe um email válido"),
	password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
})
