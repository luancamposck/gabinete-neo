// @/modules/fleet/server/services/create-driver-document-signed-urls.service.ts

import type {
	CreateDriverDocumentSignedUrlsServiceCodes,
	CreateDriverDocumentSignedUrlsServiceData,
	CreateDriverDocumentSignedUrlsServiceParams
} from "@/modules/fleet/server/types/operations/create-driver-document-signed-urls.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import { createSignedDocumentUrlsAdminRepo } from "../repos/create-signed-document-urls.admin.repo"

const prefixLog = "[createDriverDocumentSignedUrlsService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

export async function createDriverDocumentSignedUrlsService(params: CreateDriverDocumentSignedUrlsServiceParams): AppResultAsync<CreateDriverDocumentSignedUrlsServiceData, CreateDriverDocumentSignedUrlsServiceCodes> {
	const paths = [...new Set(params.paths)]

	if (paths.length === 0) {
		return { success: true, data: { urlsByPath: new Map() } }
	}

	try {
		const { data, error } = await createSignedDocumentUrlsAdminRepo({ paths })

		if (error) {
			console.error(`${prefixLog} storage error`, error.message)
			return FALLBACK_ERROR
		}

		const urlsByPath = new Map<string, string | null>()
		data.forEach((item, index) => {
			urlsByPath.set(paths[index], item.error ? null : item.signedUrl)
		})

		return { success: true, data: { urlsByPath } }
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}
