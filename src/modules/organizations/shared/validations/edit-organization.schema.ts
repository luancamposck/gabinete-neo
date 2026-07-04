// @/modules/organizations/shared/validations/edit-organization.schema.ts

import { z } from "zod"

export const editOrganizationFieldsSchema = z.object({
	name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres.").max(120, "O nome deve ter no máximo 120 caracteres."),
	description: z.string().max(300, "A descrição pode ter no máximo 300 caracteres.")
})

const organizationBaseSchema = z.object({
	id: z.string().min(1),
	appDomain: z.string().min(1),
	isActive: z.boolean(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1)
})

export const editOrganizationActionSchema = z.object({
	organization: organizationBaseSchema.merge(editOrganizationFieldsSchema)
})
