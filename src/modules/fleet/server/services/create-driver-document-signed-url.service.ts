// @/modules/fleet/server/services/create-driver-document-signed-url.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { CreateDriverDocumentSignedUrlServiceCodes, CreateDriverDocumentSignedUrlServiceData, CreateDriverDocumentSignedUrlServiceParams } from "../../shared/types/slices/create-driver-document-signed-url.types"
import { createSignedDocumentUrlAdminRepo } from "../repos/create-signed-document-url.admin.repo"

const prefixLog = "[createDriverDocumentSignedUrlService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

export async function createDriverDocumentSignedUrlService(params: CreateDriverDocumentSignedUrlServiceParams): AppResultAsync<CreateDriverDocumentSignedUrlServiceData, CreateDriverDocumentSignedUrlServiceCodes> {
	try {
		const { data, error } = await createSignedDocumentUrlAdminRepo({ path: params.path })

		if (error) {
			console.error(`${prefixLog} storage error`, error.message)
			return FALLBACK_ERROR
		}

		if (!data?.signedUrl) {
			console.error(`${prefixLog} missing signed URL`)
			return FALLBACK_ERROR
		}

		return {
			success: true,
			data: {
				signedUrl: data.signedUrl
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}
