// @/modules/organizations/server/repos/find-organization-image-path.repo.ts
import { createClient } from "@/lib/supabase/server"

export async function findOrganizationImagePathRepo({ organizationId }: { organizationId: string }) {
	const supabase = await createClient()

	return supabase.from("organizations").select("id, image_path").eq("id", organizationId).maybeSingle()
}
