import { z } from "zod"

import { adressBaseSchemaClient, phoneSchemaClient } from "@/lib/validations/atom-schemas/atom-schemas.client"

export const editUserWithProfileBaseSchemaClient = z.object({
	// Dados do usuário
	name: z.string().min(3, "Nome do usuário deve ter no mínimo 3 caracteres."),
	phone: phoneSchemaClient,

	// Endereço
	adress: adressBaseSchemaClient
})

export type EditUserWithProfileBaseSchemaClientData = z.infer<typeof editUserWithProfileBaseSchemaClient>
