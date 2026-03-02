// @/modules/organizations/server/services/delete-organization-og-image.service.ts

import { deleteOrganizationOgImageAdminRepo } from "@/modules/organizations/server/repos/delete-organization-og-image.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_DELETE_ERROR = "Não foi possível remover a imagem de Open Graph. Tente novamente mais tarde."
const DELETE_SUCCESS = "Imagem de Open Graph removida com sucesso."
const prefixLog = "[deleteOrganizationOgImageService]:"

type Params = {
	imagePath: string
}

type ErrorCodes = "infra_error"

export async function deleteOrganizationOgImageService(params: Params): OperationResponse<null, ErrorCodes> {
	try {
		const { error } = await deleteOrganizationOgImageAdminRepo({ path: params.imagePath })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_DELETE_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: DELETE_SUCCESS,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_DELETE_ERROR,
			code: "infra_error"
		}
	}
}
