// @/modules/accounts/onboarding/shared/validations/register-and-join.schema.ts

import { z } from "zod"
import { addressSchemaClient, addressSchemaServer } from "@/modules/accounts/users/profiles/shared/validations/address.schema"
import { phoneSchemaClient, phoneSchemaServer } from "@/modules/accounts/users/profiles/shared/validations/phone.schema"

export const registerAndJoinSchemaClient = z
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
		address: addressSchemaClient
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"]
	})
	.refine((data) => data.email === data.confirmEmail, {
		message: "Os emails não coincidem.",
		path: ["confirmEmail"]
	})

export type RegisterAndJoinSchemaClientData = z.infer<typeof registerAndJoinSchemaClient>

export const registerAndJoinSchemaServer = z.object({
	// Dados do usuário
	name: z.string().min(3, "Nome do usuário deve ter no mínimo 3 caracteres."),
	phone: phoneSchemaServer,

	// Login do usuário
	email: z.email("Por favor, insira um email válido."),
	password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),

	// Endereço
	address: addressSchemaServer
})
