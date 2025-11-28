import { z } from "zod"

export const signInSchemaServer = z.object({
	email: z.email("Informe um email válido").trim().toLowerCase(),
	password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
})
