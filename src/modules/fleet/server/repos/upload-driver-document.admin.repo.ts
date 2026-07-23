// @/modules/fleet/server/repos/upload-driver-document.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { UploadDriverDocumentAdminRepoParams, UploadDriverDocumentAdminRepoResult } from "@/modules/fleet/server/types/operations/upload-driver-document.types"
import { FLEET_DOCUMENTS_BUCKET } from "@/modules/fleet/shared/constants/document-storage"

export async function uploadDriverDocumentAdminRepo(params: UploadDriverDocumentAdminRepoParams) {
	const supabaseAdmin = createAdminClient()
	const path = `fleet/${params.organizationId}/${params.userId}/${crypto.randomUUID()}.${params.ext}`

	const res = await supabaseAdmin.storage.from(FLEET_DOCUMENTS_BUCKET).upload(path, params.file, {
		contentType: params.file.type,
		upsert: false,
		cacheControl: "3600"
	})

	return {
		...res,
		data: res.data ? ({ path } satisfies UploadDriverDocumentAdminRepoResult) : null
	}
}
