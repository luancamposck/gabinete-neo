import { z } from "zod"
import { slugify } from "@/lib/utils/slugify-utils"

export const organizationBaseSchemaServer = z.object({
	name: z.string().min(1, "Nome da organização é obrigatório.").max(255, "Máximo de 255 caracteres"),
	slug: z
		.string()
		.min(1, "Um slug é obrigatório")
		.max(255, "Máximo de 255 caracteres")
		.transform((value) => slugify(value))
})
