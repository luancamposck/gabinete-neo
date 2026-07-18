// @/modules/organizations/server/services/get-organization-image-url.service.ts

import { findOrganizationImagePathAdminRepo } from "@/modules/organizations/server/repos/find-organization-image-path.admin.repo"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const prefixLog = "[getOrganizationImageUrlService]:"
const GENERIC_ERROR = "Não foi possível obter a imagem. Tente novamente mais tarde."
const ORG_NOT_FOUND_ERROR = "Organização não encontrada."

type ErrorCodes = "org_not_found" | "infra_error"

export async function getOrganizationImagePathService({ organizationId }: { organizationId: string }): OperationResponse<{ imagePath: string | null }, ErrorCodes> {
	try {
		const { data, error } = await findOrganizationImagePathAdminRepo({ organizationId })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				code: "infra_error",
				message: GENERIC_ERROR
			}
		}

		if (!data) {
			console.error(`${prefixLog} organization not found for id=${organizationId}`)
			return {
				success: false,
				code: "org_not_found",
				message: ORG_NOT_FOUND_ERROR
			}
		}

		const imagePath = data.image_path

		return {
			success: true,
			message: "Imagem obtida com sucesso.",
			data: { imagePath }
		}
	} catch (err) {
		rethrowIfNextError(err)
		console.error(`${prefixLog} unexpected error:`, err)
		return { success: false, code: "infra_error", message: GENERIC_ERROR }
	}
}
