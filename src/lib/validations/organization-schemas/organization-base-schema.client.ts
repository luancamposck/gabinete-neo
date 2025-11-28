import { z } from "zod"

import { slugify } from "@/lib/utils/slugify-utils"

export const organizationBaseSchemaClient = z.object({
	name: z.string().min(1, "Nome da organização é obrigatório.").max(255, "Máximo de 255 caracteres"),
	slug: z
		.string()
		.min(1, "Um slug é obrigatório")
		.max(255, "Máximo de 255 caracteres")
		.refine((value) => value === slugify(value), "Slug inválido. Use apenas letras minúsculas, números e hífens.")
})
