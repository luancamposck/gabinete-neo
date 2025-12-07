import { z } from "zod"

import { RELATIONSHIP_OPTIONS, type RelationshipValue } from "@/lib/constants/relationship-options"
import { userBaseSchemaServer } from "@/lib/validations/users/user-base-schema.server"

const RELATIONSHIP_VALUES = RELATIONSHIP_OPTIONS.map((opt) => opt.value) as [RelationshipValue, ...RelationshipValue[]]

const relationshipToInviterSchema = z.enum(RELATIONSHIP_VALUES)
// type RelationshipToInviter = z.infer<typeof relationshipToInviterSchema> // mesma coisa que RelationshipValue

export const createUserWithInvitationSchemaServer = z.object({
	user: userBaseSchemaServer,
	relationship: relationshipToInviterSchema,

	inviterUserId: z.string().min(1, "Id do usuário que convidou é obrigatório"),
	organizationId: z.string().min(1, "Id da organização é obrigatório")
})

export type CreateUserWithInvitationSchemaServerData = z.infer<typeof createUserWithInvitationSchemaServer>
