// @/modules/organizations/server/repos/upload-organization-og-image.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

type Params = {
	organizationId: string
	file: File
}

type UploadResult = {
	path: string
}

function getExtFromMime(mime: string): "jpg" | "png" | "webp" {
	switch (mime) {
		case "image/jpeg":
			return "jpg"
		case "image/png":
			return "png"
		case "image/webp":
			return "webp"
		default:
			// fallback seguro: se o bucket já está limitando MIME types,
			// isso só entra em edge cases.
			return "webp"
	}
}

/**
 * Faz upload da OG image para o bucket público "public-assets".
 * Salva em um path único (uuid) para evitar cache de OG nas redes sociais.
 */
export async function uploadOrganizationOgImageAdminRepo(params: Params) {
	const supabase = createAdminClient()

	const ext = getExtFromMime(params.file.type)
	const path = `org/${params.organizationId}/og/${crypto.randomUUID()}.${ext}`

	const res = await supabase.storage.from("public-assets").upload(path, params.file, {
		contentType: params.file.type,
		upsert: false, // evita sobrescrever por acidente; path é único por design
		cacheControl: "3600"
	})

	return {
		...res, // { data, error }
		data: res.data ? ({ path } satisfies UploadResult) : null
	}
}
