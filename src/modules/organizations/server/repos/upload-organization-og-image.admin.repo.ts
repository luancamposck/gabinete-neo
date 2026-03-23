// @/modules/organizations/server/repos/upload-organization-og-image.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

type Params = {
	organizationId: string
	file: File
	ext: string
}

type UploadResult = {
	path: string
}

/**
 * Faz upload da OG image para o bucket público "public-assets".
 * Salva em um path único (uuid) para evitar cache de OG nas redes sociais.
 */
export async function uploadOrganizationOgImageAdminRepo(params: Params) {
	const supabase = createAdminClient()

	const path = `org/${params.organizationId}/og/${crypto.randomUUID()}.${params.ext}`

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
