// @/modules/fleet/server/services/create-driver-document-signed-url.service.ts

import { createSignedDocumentUrlAdminRepo } from "@/modules/fleet/server/repos/create-signed-document-url.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type Params = {
	path: string
}

type ServiceRes = {
	signedUrl: string
}

type ErrorCodes = "infra_error"

const MSG_CREATE_SIGNED_URL_ERROR = "Não foi possível gerar o link do documento. Tente novamente mais tarde."
const MSG_CREATE_SIGNED_URL_SUCCESS = "Link do documento gerado com sucesso."
const prefixLog = "[createDriverDocumentSignedUrlService]:"

export async function createDriverDocumentSignedUrlService(params: Params): OperationResponse<ServiceRes, ErrorCodes> {
	try {
		const { data, error } = await createSignedDocumentUrlAdminRepo({ path: params.path })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_CREATE_SIGNED_URL_ERROR,
				code: "infra_error"
			}
		}

		if (!data?.signedUrl) {
			console.error(`${prefixLog} missing signed URL`)
			return {
				success: false,
				message: MSG_CREATE_SIGNED_URL_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: MSG_CREATE_SIGNED_URL_SUCCESS,
			data: {
				signedUrl: data.signedUrl
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: MSG_CREATE_SIGNED_URL_ERROR,
			code: "infra_error"
		}
	}
}
