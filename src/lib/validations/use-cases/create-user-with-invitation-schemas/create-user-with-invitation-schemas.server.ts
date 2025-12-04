import { z } from "zod"

import { userBaseSchemaServer } from "@/lib/validations/users/user-base-schema.server"

export const createUserWithInvitationSchemaServer = z.object({
	user: userBaseSchemaServer,

	inviteToken: z.string().min(1, "Token de convite obrigatório")
})

export type CreateUserWithInvitationSchemaServerData = z.infer<typeof createUserWithInvitationSchemaServer>
