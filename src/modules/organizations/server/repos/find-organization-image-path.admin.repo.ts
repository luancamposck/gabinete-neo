// @/modules/organizations/server/repos/find-organization-image-path.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

export async function findOrganizationImagePathAdminRepo({ organizationId }: { organizationId: string }) {
	const supabase = createAdminClient()

	return supabase.from("organizations").select("id, image_path").eq("id", organizationId).maybeSingle()
}
