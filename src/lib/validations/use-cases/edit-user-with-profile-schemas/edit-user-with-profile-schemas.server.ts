import { z } from "zod"

import { adressBaseSchemaServer, phoneSchemaServer } from "@/lib/validations/atom-schemas/atom-schemas.server"

export const editUserWithProfileBaseSchemaServer = z.object({
	// Dados do usuário
	name: z.string().min(3, "Nome do usuário deve ter no mínimo 3 caracteres."),
	phone: phoneSchemaServer,

	// Endereço
	adress: adressBaseSchemaServer
})

export type EditUserWithProfileBaseSchemaServerData = z.infer<typeof editUserWithProfileBaseSchemaServer>
