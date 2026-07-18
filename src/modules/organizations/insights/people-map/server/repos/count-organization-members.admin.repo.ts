import { createAdminClient } from "@/lib/supabase/admin"

export async function countOrganizationMembersAdminRepo({ organizationId }: { organizationId: string }) {
	const supabase = createAdminClient()

	return supabase.from("memberships").select("*", { count: "exact", head: true }).eq("organization_id", organizationId)
}
