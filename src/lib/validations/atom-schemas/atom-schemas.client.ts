import { z } from "zod"

import { brazilianDdds } from "@/lib/constants/brazillian-ddds"

const onlyDigits = (s: string) => s.replace(/\D/g, "")
const brazilianDddSet = new Set(brazilianDdds.map((item) => item.ddd))

export const adressBaseSchemaClient = z.object({
	cep: z.string().length(9, "CEP deve conter 8 dígitos. Formato: 00000-000"),
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.string().length(2, "Estado deve ter 2 caracteres."),
	complement: z.string().optional()
})

export const phoneSchemaClient = z.string().superRefine((value, ctx) => {
	const digits = onlyDigits(value) // "(11) 98765-4321" -> "11987654321"

	// Se for obrigatório, você pode tratar vazio aqui ou com .min() antes
	if (digits.length === 0) {
		ctx.addIssue({
			code: "custom",
			message: "Celular é obrigatório."
		})
		return
	}

	if (digits.length !== 10 && digits.length !== 11) {
		ctx.addIssue({
			code: "custom",
			message: "Celular inválido. Use (00) 00000-0000 ou (00) 0000-0000"
		})
		return
	}

	const ddd = digits.slice(0, 2)

	if (!brazilianDddSet.has(ddd)) {
		ctx.addIssue({
			code: "custom",
			message: "DDD inválido."
		})
	}
})
