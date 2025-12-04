import { z } from "zod"

import { RELATIONSHIP_OPTIONS, type RelationshipValue } from "@/lib/constants/relationship-options"
import { userBaseSchemaClient } from "@/lib/validations/users/user-base-schema.client"

const RELATIONSHIP_VALUES = RELATIONSHIP_OPTIONS.map((opt) => opt.value) as [RelationshipValue, ...RelationshipValue[]]

const relationshipToInviterSchema = z.enum(RELATIONSHIP_VALUES)
// type RelationshipToInviter = z.infer<typeof relationshipToInviterSchema> // mesma coisa que RelationshipValue

export const createUserWithInvitationSchemaClient = z.object({
	user: userBaseSchemaClient,
	relationship: relationshipToInviterSchema
})

export type CreateUserWithInvitationSchemaClientData = z.infer<typeof createUserWithInvitationSchemaClient>
