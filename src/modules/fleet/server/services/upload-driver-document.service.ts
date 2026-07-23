// @/modules/fleet/server/services/upload-driver-document.service.ts

import type { UploadDriverDocumentServiceCodes, UploadDriverDocumentServiceData, UploadDriverDocumentServiceParams } from "@/modules/fleet/server/types/operations/upload-driver-document.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import { uploadDriverDocumentAdminRepo } from "../repos/upload-driver-document.admin.repo"

const prefixLog = "[uploadDriverDocumentService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

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

/**
 * Envia um único documento de motorista (ex.: CRLV ou CNH) pro bucket privado fleet-documents.
 *
 * Responsabilidades:
 * - Subir exatamente um arquivo e devolver seu path no bucket.
 * - Não valida tamanho/mime do arquivo — isso é contrato do Zod na Action.
 * - Não sabe qual documento está subindo (CRLV, CNH ou outro) nem orquestra
 *   múltiplos uploads — isso é responsabilidade de quem chama (Use-case),
 *   que decide quantos documentos existem e como compensar falha parcial.
 *
 * @param params - Dados usados para subir o documento.
 * @param params.organizationId - Organização dona do documento.
 * @param params.userId - Usuário candidato dono do documento.
 * @param params.file - Arquivo já validado pela Action.
 *
 * @returns Uma resposta padronizada da operação contendo o path do documento no bucket.
 */
export async function uploadDriverDocumentService(params: UploadDriverDocumentServiceParams): AppResultAsync<UploadDriverDocumentServiceData, UploadDriverDocumentServiceCodes> {
	try {
		const { data, error } = await uploadDriverDocumentAdminRepo({
			organizationId: params.organizationId,
			userId: params.userId,
			file: params.file,
			ext: getExtFromMime(params.file.type)
		})

		if (error || !data?.path) {
			console.error(`${prefixLog} upload failed`, error?.message ?? "missing path")
			return FALLBACK_ERROR
		}

		return {
			success: true,
			data: {
				path: data.path
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}
