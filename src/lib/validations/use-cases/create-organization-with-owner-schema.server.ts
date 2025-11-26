import { z } from "zod"

import { organizationBaseSchemaClient } from "@/lib/validations/organization-schemas/organization-base-schema.client"
import { userBaseSchemaClient } from "@/lib/validations/users/user-base-schema.client"

export const createOrganizationWithOwnerSchemaClient = z.object({
	user: userBaseSchemaClient,

	organization: organizationBaseSchemaClient
})
