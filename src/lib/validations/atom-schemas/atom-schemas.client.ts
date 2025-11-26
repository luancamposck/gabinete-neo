import { z } from "zod"

export const adressBaseSchemaClient = z.object({
	cep: z.string().length(9, "CEP deve conter 8 dígitos. Formato: 00000-000"),
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.string().length(2, "Estado deve ter 2 caracteres."),
	complement: z.string().optional()
})
