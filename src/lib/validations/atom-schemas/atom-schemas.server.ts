import { z } from "zod"

const onlyDigits = (s: string) => s.replace(/\D/g, "")

export const cpfSchemaServer = z
	.string()
	.transform(onlyDigits)
	.refine((v) => v.length === 11, "CPF deve ter 11 dígitos.")

export const cnpjSchemaServer = z
	.string()
	.transform(onlyDigits)
	.refine((v) => v.length === 14, "CNPJ deve ter 14 dígitos.")

export const phoneSchemaServer = z
	.string()
	.transform(onlyDigits)
	.refine((v) => v.length === 10 || v.length === 11, "Telefone deve ter 10 ou 11 dígitos.")

export const cepSchemaServer = z
	.string()
	.transform(onlyDigits)
	.refine((v) => v.length === 8, "CPF deve ter 8 dígitos.")

export const adressBaseSchemaServer = z.object({
	cep: cepSchemaServer,
	street: z.string().min(1, "Rua é obrigatória."),
	number: z.string().min(1, "Número é obrigatório."),
	neighborhood: z.string().min(1, "Bairro é obrigatório."),
	city: z.string().min(1, "Cidade é obrigatória."),
	state: z.string().length(2, "Estado deve ter 2 caracteres."),
	complement: z.string().optional()
})
