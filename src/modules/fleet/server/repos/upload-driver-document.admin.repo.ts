// @/modules/fleet/server/repos/upload-driver-document.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

const FLEET_DOCUMENTS_BUCKET = "fleet-documents"

type Params = {
	organizationId: string
	userId: string
	file: File
	ext: string
}

type UploadResult = {
	path: string
}

export async function uploadDriverDocumentAdminRepo(params: Params) {
	const supabaseAdmin = createAdminClient()
	const path = `fleet/${params.organizationId}/${params.userId}/${crypto.randomUUID()}.${params.ext}`

	const res = await supabaseAdmin.storage.from(FLEET_DOCUMENTS_BUCKET).upload(path, params.file, {
		contentType: params.file.type,
		upsert: false,
		cacheControl: "3600"
	})

	return {
		...res,
		data: res.data ? ({ path } satisfies UploadResult) : null
	}
}
