// @/modules/organizations/server/slices/update-current-organization/actions/update-current-organization.action.ts
"use server"

import { updateCurrentOrganizationUseCase } from "@/modules/organizations/server/slices/update-current-organization/use-cases/update-current-organization.use-case"
import type { OrganizationView } from "@/modules/organizations/shared/types/views"
import { editOrganizationActionSchema } from "@/modules/organizations/shared/validations/edit-organization.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const INVALID_INPUT_MESSAGE = "Dados inválidos. Verifique os campos e tente novamente."

export async function updateCurrentOrganizationAction(formData: unknown): OperationResponse<{ organization: OrganizationView }, "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"> {
	const parsed = editOrganizationActionSchema.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	const { organization } = parsed.data

	const normalizedDescription = organization.description.trim()

	const updateRes = await updateCurrentOrganizationUseCase({
		organization: {
			id: organization.id,
			name: organization.name,
			description: normalizedDescription.length > 0 ? normalizedDescription : null,
			slug: organization.slug,
			app_domain: organization.appDomain,
			is_active: organization.isActive,
			created_at: organization.createdAt,
			updated_at: organization.updatedAt,
			created_by_user_id: organization.createdByUserId
		}
	})

	return updateRes
}
