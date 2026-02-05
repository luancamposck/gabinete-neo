// @/modules/organizations/server/slices/delete-organization-og-image/actions/delete-organization-og-image.action.ts
"use server"

import { deleteOrganizationOgImageUseCase } from "@/modules/organizations/server/slices/delete-organization-og-image/use-cases/delete-organization-og-image.use-case"

export async function deleteOrganizationOgImageAction() {
	return deleteOrganizationOgImageUseCase()
}
