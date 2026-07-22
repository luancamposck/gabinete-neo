// @/modules/fleet/server/repos/create-signed-document-urls.admin.repo.ts
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { DOCUMENT_SIGNED_URL_TTL_SECONDS, FLEET_DOCUMENTS_BUCKET } from "@/modules/fleet/shared/constants/document-storage"
import type { CreateSignedDocumentUrlsAdminRepoParams } from "../../shared/types/slices/create-driver-document-signed-urls.types"

export async function createSignedDocumentUrlsAdminRepo(params: CreateSignedDocumentUrlsAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.storage.from(FLEET_DOCUMENTS_BUCKET).createSignedUrls(params.paths, params.expiresIn ?? DOCUMENT_SIGNED_URL_TTL_SECONDS)
}
