// @/modules/accounts/users/profiles/shared/validations/phone.schema.ts
import { z } from "zod"
import { brazilianDdds } from "@/lib/constants/brazillian-ddds"

const onlyDigits = (s: string) => s.replace(/\D/g, "")
const brazilianDddSet = new Set(brazilianDdds.map((item) => item.ddd))

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

export const phoneSchemaServer = z
	.string()
	.transform(onlyDigits)
	.refine((v) => v.length === 10 || v.length === 11, "Telefone deve ter 10 ou 11 dígitos.")
