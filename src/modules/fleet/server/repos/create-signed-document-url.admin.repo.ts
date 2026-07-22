// @/modules/fleet/server/repos/create-signed-document-url.admin.repo.ts
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { DOCUMENT_SIGNED_URL_TTL_SECONDS, FLEET_DOCUMENTS_BUCKET } from "@/modules/fleet/shared/constants/document-storage"
import type { CreateSignedDocumentUrlAdminRepoParams } from "../../shared/types/slices/create-driver-document-signed-url.types"

export async function createSignedDocumentUrlAdminRepo(params: CreateSignedDocumentUrlAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.storage.from(FLEET_DOCUMENTS_BUCKET).createSignedUrl(params.path, params.expiresIn ?? DOCUMENT_SIGNED_URL_TTL_SECONDS)
}
