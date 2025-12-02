import { z } from "zod"

import { userBaseSchemaClient } from "@/lib/validations/users/user-base-schema.client"

export const createUserWithInvitationSchemaClient = z.object({
	user: userBaseSchemaClient
})

export type CreateUserWithInvitationSchemaClientData = z.infer<typeof createUserWithInvitationSchemaClient>
