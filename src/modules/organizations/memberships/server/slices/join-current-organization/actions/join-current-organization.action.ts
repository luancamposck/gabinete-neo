// @/modules/organizations/memberships/server/slices/join-current-organization/actions/join-current-organization.action.ts

"use server"

import { joinCurrentOrganizationUseCase } from "@/modules/organizations/memberships/server/slices/join-current-organization/use-cases/join-current-organization.use-case"

export async function joinCurrentOrganizationAction() {
	return joinCurrentOrganizationUseCase()
}
