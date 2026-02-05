// @/modules/organizations/shared/validations/upload-organization-og-image.schema.ts

import { z } from "zod"

export const MAX_ORGANIZATION_OG_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

export const ORGANIZATION_OG_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const uploadOrganizationOgImageSchema = z.object({
	file: z
		.file({ error: "Selecione uma imagem." })
		.max(MAX_ORGANIZATION_OG_IMAGE_SIZE_BYTES, { error: "A imagem deve ter no máximo 2 MB." })
		.mime(Array.from(ORGANIZATION_OG_IMAGE_MIME_TYPES), { error: "Arquivo inválido. Envie uma imagem JPG, PNG ou WEBP." })
})
