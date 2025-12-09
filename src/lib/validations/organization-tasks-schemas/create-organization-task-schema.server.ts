// src/lib/validations/organization-tasks-schemas/create-organization-task-schema.server.ts

import { z } from "zod"

export const createOrganizationTaskBaseSchemaServer = z.object({
	title: z.string().min(3, "Título deve ter pelo menos 3 caracteres.").max(200, "Título deve ter no máximo 200 caracteres."),
	description: z.string().max(2000, "Descrição deve ter no máximo 2000 caracteres.").optional().nullable(),
	dueDate: z
		.date("Prazo inválido.")
		.optional()
		.nullable()
		.refine(
			(value) => {
				if (!value) return true
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const candidate = new Date(value)
				candidate.setHours(0, 0, 0, 0)
				return candidate >= today
			},
			{ message: "O prazo não pode ser no passado." }
		)
})

export type CreateOrganizationTaskSchemaServerData = z.infer<typeof createOrganizationTaskBaseSchemaServer>
