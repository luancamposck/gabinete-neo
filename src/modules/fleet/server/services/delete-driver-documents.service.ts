// @/modules/fleet/server/services/delete-driver-documents.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import { deleteDriverDocumentsAdminRepo } from "../repos/delete-driver-documents.admin.repo"

const prefixLog = "[deleteDriverDocumentsService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "infra_error"
} as const

export async function deleteDriverDocumentsService({ paths }: { paths: string[] }): AppResultAsync<null, "infra_error"> {
	try {
		const { error } = await deleteDriverDocumentsAdminRepo({ paths })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return FALLBACK_ERROR
		}

		return {
			success: true,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}
