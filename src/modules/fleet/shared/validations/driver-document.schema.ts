// @/modules/fleet/shared/validations/driver-document.schema.ts

import { z } from "zod"
import { DRIVER_DOCUMENT_MIME_TYPES, MAX_DRIVER_DOCUMENT_SIZE_BYTES } from "@/modules/fleet/shared/constants/driver-document"

export const driverDocumentFileSchema = z
	.file({ error: "Envie o documento." })
	.max(MAX_DRIVER_DOCUMENT_SIZE_BYTES, { error: "O documento deve ter no máximo 10 MB." })
	.mime(Array.from(DRIVER_DOCUMENT_MIME_TYPES), { error: "Arquivo inválido. Envie PDF, JPG, PNG ou WEBP." })
