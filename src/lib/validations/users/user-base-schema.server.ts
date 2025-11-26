import { z } from "zod"

import { adressBaseSchemaServer, cpfSchemaServer, phoneSchemaServer } from "@/lib/validations/atom-schemas/atom-schemas.server"

const userBaseSchemaServer = z.object({
	// Dados do usuário
	name: z.string().min(3, "Nome do usuário deve ter no mínimo 3 caracteres."),
	cpf: cpfSchemaServer,
	phone: phoneSchemaServer,

	// Login do usuário
	email: z.email("Por favor, insira um email válido."),
	password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),

	// Endereço
	adress: adressBaseSchemaServer
})

type UserBaseServerData = z.infer<typeof userBaseSchemaServer>

export { userBaseSchemaServer }
export type { UserBaseServerData }
