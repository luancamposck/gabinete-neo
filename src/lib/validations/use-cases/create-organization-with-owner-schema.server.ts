import { z } from "zod"

import { organizationBaseSchemaServer } from "@/lib/validations/organization-schemas/organization-base-schema.server"
import { userBaseSchemaServer } from "@/lib/validations/users/user-base-schema.server"

export const createOrganizationWithOwnerSchemaServer = z.object({
	user: userBaseSchemaServer,

	organization: organizationBaseSchemaServer
})
