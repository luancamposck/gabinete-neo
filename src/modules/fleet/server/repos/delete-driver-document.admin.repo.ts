// @/modules/fleet/server/repos/delete-driver-document.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

const FLEET_DOCUMENTS_BUCKET = "fleet-documents"

type Params = {
	paths: string[]
}

export async function deleteDriverDocumentAdminRepo(params: Params) {
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
