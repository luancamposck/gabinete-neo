import { z } from "zod"

export const organizationBaseSchemaClient = z.object({
	name: z.string().min(1, "Nome da organização é obrigatório.").max(255),
	slug: z.string().min(1, "Um slug é obrigatório").max(255)
})
