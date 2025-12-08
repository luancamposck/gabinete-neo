import { z } from "zod"

import { adressBaseSchemaClient, phoneSchemaClient } from "@/lib/validations/atom-schemas/atom-schemas.client"

export const userBaseSchemaClient = z
	.object({
		// Dados do usuário
		name: z.string().min(3, "Nome do usuário deve ter no mínimo 3 caracteres."),
		phone: phoneSchemaClient,

		// Login do usuário
		email: z.email("Por favor, insira um email válido."),
		confirmEmail: z.email("Por favor, insira um email válido para confirmação."),
		password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
		confirmPassword: z.string().min(8, "A confirmação de senha deve ter no mínimo 8 caracteres."),

		// Endereço
		adress: adressBaseSchemaClient
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"]
	})
	.refine((data) => data.email === data.confirmEmail, {
		message: "Os emails não coincidem.",
		path: ["confirmEmail"]
	})

export type UserBaseClientData = z.infer<typeof userBaseSchemaClient>
