import { createAdminClient } from "@/lib/supabase/admin"

export async function findOrganizationWithMemberhipAdminRepo(params: { organizationId: string; userId: string }) {
	const { organizationId, userId } = params
	const supabase = createAdminClient()

	return supabase
		.from("organizations")
		.select(`
    *,
    memberships!inner(*)
  `)
		.eq("id", organizationId)
		.eq("memberships.user_id", userId)
		.maybeSingle()
}
