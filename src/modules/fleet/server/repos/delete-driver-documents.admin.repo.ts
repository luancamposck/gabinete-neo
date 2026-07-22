// @/modules/fleet/server/repos/delete-driver-documents.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import { FLEET_DOCUMENTS_BUCKET } from "@/modules/fleet/shared/constants/document-storage"

type Params = {
	paths: string[]
}

export async function deleteDriverDocumentsAdminRepo(params: Params) {
	const supabaseAdmin = createAdminClient()
	const paths = params.paths.filter(Boolean)

	if (paths.length === 0) {
		return {
			data: [],
			error: null
		}
	}

	return supabaseAdmin.storage.from(FLEET_DOCUMENTS_BUCKET).remove(paths)
}
