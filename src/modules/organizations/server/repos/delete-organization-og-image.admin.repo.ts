// @/modules/organizations/server/repos/delete-organization-og-image.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

type Params = {
	path: string
}

/**
 * Remove a OG image do bucket público "public-assets".
 */
export async function deleteOrganizationOgImageAdminRepo(params: Params) {
	const supabase = createAdminClient()

	return supabase.storage.from("public-assets").remove([params.path])
}
