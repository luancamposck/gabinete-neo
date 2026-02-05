// @/modules/organizations/server/services/upload-organization-og-image.service.ts

import { uploadOrganizationOgImageAdminRepo } from "@/modules/organizations/server/repos/upload-organization-og-image.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type UploadOrganizationOgImageServiceParams = {
	organizationId: string
	file: File
}

type UploadOrganizationOgImageServiceRes = {
	path: string
}

type UploadOrganizationOgImageServiceCodes = "invalid_file" | "infra_error"

const MAX_OG_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

const GENERIC_UPLOAD_ERROR = "Não foi possível enviar a imagem de Open Graph. Tente novamente mais tarde."
const INVALID_FILE_ERROR = "Arquivo inválido. Envie uma imagem JPG, PNG ou WEBP com até 2 MB."
const UPLOAD_SUCCESS = "Imagem de Open Graph enviada com sucesso."
const prefixLog = "[uploadOrganizationOgImageService]:"

function isAllowedOgImageMimeType(mimeType: string) {
	return mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp"
}

export async function uploadOrganizationOgImageService(params: UploadOrganizationOgImageServiceParams): OperationResponse<UploadOrganizationOgImageServiceRes, UploadOrganizationOgImageServiceCodes> {
	try {
		if (!params.file || params.file.size > MAX_OG_IMAGE_SIZE_BYTES || !isAllowedOgImageMimeType(params.file.type)) {
			return {
				success: false,
				message: INVALID_FILE_ERROR,
				code: "invalid_file"
			}
		}

		const { data, error } = await uploadOrganizationOgImageAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_UPLOAD_ERROR,
				code: "infra_error"
			}
		}

		if (!data?.path) {
			console.error(`${prefixLog} missing path after upload`)
			return {
				success: false,
				message: GENERIC_UPLOAD_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: UPLOAD_SUCCESS,
			data: {
				path: data.path
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_UPLOAD_ERROR,
			code: "infra_error"
		}
	}
}
