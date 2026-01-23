import { z } from "zod"

const onlyDigits = (s: string) => s.replace(/\D/g, "")

export const addressSchemaClient = z.object({
	cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido. Formato: 00000-000"),
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.string().length(2, "Estado deve ter 2 caracteres."),
	complement: z.string().optional()
})

export const addressSchemaServer = z.object({
	cep: z
		.string()
		.transform(onlyDigits)
		.refine((v) => v.length === 8, "CEP deve ter 8 dígitos."),
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.string().length(2, "Estado deve ter 2 caracteres."),
	complement: z.string().optional()
})
