import { z } from "zod"

export const signUpSchema = z.object({
	name: z.string().min(1, "o Nome é obrigatório"),
	email: z.email("Informe um email válido"),
	cpf: z
		.string()
		.transform((val) => val.replace(/\D/g, "")) // remove tudo que não for número
		.refine((val) => val.length === 11, "CPF deve ter 11 dígitos"),
	password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
})
