// @/modules/fleet/server/repos/create-signed-document-url.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

const FLEET_DOCUMENTS_BUCKET = "fleet-documents"
const DOCUMENT_SIGNED_URL_TTL_SECONDS = 300

type Params = {
	path: string
	expiresIn?: number
}

export async function createSignedDocumentUrlAdminRepo(params: Params) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.storage.from(FLEET_DOCUMENTS_BUCKET).createSignedUrl(params.path, params.expiresIn ?? DOCUMENT_SIGNED_URL_TTL_SECONDS)
}
