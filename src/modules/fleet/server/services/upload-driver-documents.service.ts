// @/modules/fleet/server/services/upload-driver-documents.service.ts

import { deleteDriverDocumentAdminRepo } from "@/modules/fleet/server/repos/delete-driver-document.admin.repo"
import { uploadDriverDocumentAdminRepo } from "@/modules/fleet/server/repos/upload-driver-document.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type UploadDriverDocumentsServiceParams = {
	organizationId: string
	userId: string
	crlv: File
	cnh: File
}

type UploadDriverDocumentsServiceRes = {
	crlvPath: string
	cnhPath: string
}

type ErrorCodes = "invalid_file" | "infra_error"

const MAX_DRIVER_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024

const MSG_INVALID_FILE = "Arquivo inválido. Envie CRLV e CNH em PDF, JPG, PNG ou WEBP com até 10 MB cada."
const MSG_UPLOAD_ERROR = "Não foi possível enviar os documentos. Tente novamente mais tarde."
const MSG_UPLOAD_SUCCESS = "Documentos enviados com sucesso."
const prefixLog = "[uploadDriverDocumentsService]:"

function isAllowedDriverDocumentMimeType(mimeType: string) {
	return mimeType === "application/pdf" || mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp"
}

function getExtFromMime(mimeType: string): "pdf" | "jpg" | "png" | "webp" {
	switch (mimeType) {
		case "application/pdf":
			return "pdf"
		case "image/jpeg":
			return "jpg"
		case "image/png":
			return "png"
		case "image/webp":
			return "webp"
		default:
			return "pdf"
	}
}

function isValidDriverDocumentFile(file: File) {
	return file.size > 0 && file.size <= MAX_DRIVER_DOCUMENT_SIZE_BYTES && isAllowedDriverDocumentMimeType(file.type)
}

async function cleanupUploadedDocuments(paths: string[]) {
	const { error } = await deleteDriverDocumentAdminRepo({ paths })

	if (error) {
		console.error(`${prefixLog} cleanup failed: ${error.message}`)
	}
}

export async function uploadDriverDocumentsService(params: UploadDriverDocumentsServiceParams): OperationResponse<UploadDriverDocumentsServiceRes, ErrorCodes> {
	const uploadedPaths: string[] = []

	try {
		if (!isValidDriverDocumentFile(params.crlv) || !isValidDriverDocumentFile(params.cnh)) {
			return {
				success: false,
				message: MSG_INVALID_FILE,
				code: "invalid_file"
			}
		}

		const crlvUpload = await uploadDriverDocumentAdminRepo({
			organizationId: params.organizationId,
			userId: params.userId,
			file: params.crlv,
			ext: getExtFromMime(params.crlv.type)
		})

		if (crlvUpload.error || !crlvUpload.data?.path) {
			console.error(`${prefixLog} CRLV upload failed: ${crlvUpload.error?.message ?? "missing path"}`)
			return {
				success: false,
				message: MSG_UPLOAD_ERROR,
				code: "infra_error"
			}
		}

		uploadedPaths.push(crlvUpload.data.path)

		const cnhUpload = await uploadDriverDocumentAdminRepo({
			organizationId: params.organizationId,
			userId: params.userId,
			file: params.cnh,
			ext: getExtFromMime(params.cnh.type)
		})

		if (cnhUpload.error || !cnhUpload.data?.path) {
			console.error(`${prefixLog} CNH upload failed: ${cnhUpload.error?.message ?? "missing path"}`)
			await cleanupUploadedDocuments(uploadedPaths)

			return {
				success: false,
				message: MSG_UPLOAD_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: MSG_UPLOAD_SUCCESS,
			data: {
				crlvPath: crlvUpload.data.path,
				cnhPath: cnhUpload.data.path
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		await cleanupUploadedDocuments(uploadedPaths)

		return {
			success: false,
			message: MSG_UPLOAD_ERROR,
			code: "infra_error"
		}
	}
}
