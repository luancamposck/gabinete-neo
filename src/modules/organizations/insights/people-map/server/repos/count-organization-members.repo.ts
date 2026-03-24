import { createClient } from "@/lib/supabase/server"

export async function countOrganizationMembersRepo({ organizationId }: { organizationId: string }) {
	const supabase = await createClient()

	return supabase.from("organization_memberships").select("*", { count: "exact", head: true }).eq("organization_id", organizationId)
}
