// @/modules/fleet/server/services/delete-driver-documents.service.ts

import { deleteDriverDocumentAdminRepo } from "@/modules/fleet/server/repos/delete-driver-document.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type DeleteDriverDocumentsServiceParams = {
	paths: string[]
}

type ErrorCodes = "infra_error"

const MSG_DELETE_SUCCESS = "Documentos removidos com sucesso."
const MSG_DELETE_ERROR = "Não foi possível remover os documentos. Tente novamente mais tarde."
const prefixLog = "[deleteDriverDocumentsService]:"

export async function deleteDriverDocumentsService(params: DeleteDriverDocumentsServiceParams): OperationResponse<null, ErrorCodes> {
	try {
		const { error } = await deleteDriverDocumentAdminRepo({ paths: params.paths })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_DELETE_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: MSG_DELETE_SUCCESS,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: MSG_DELETE_ERROR,
			code: "infra_error"
		}
	}
}
