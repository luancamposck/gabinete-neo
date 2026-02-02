import { createClient } from "@/lib/supabase/server"

export async function findOrganizationWithMemberhipRepo(params: { organizationId: string; userId: string }) {
	const { organizationId, userId } = params
	const supabase = await createClient()

	return supabase
		.from("organizations")
		.select(`
    *,
    organization_memberships!inner(*)
  `)
		.eq("id", organizationId)
		.eq("organization_memberships.user_id", userId)
		.maybeSingle()
}
