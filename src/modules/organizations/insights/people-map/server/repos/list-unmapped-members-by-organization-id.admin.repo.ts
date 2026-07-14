import { createAdminClient } from "@/lib/supabase/admin"

export async function listUnmappedMembersByOrganizationIdAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("memberships")
		.select(
			`
			user:users!memberships_user_id_fkey (
				id,
				name,
				profile:user_profiles(
					city
				)
			)
		`
		)
		.eq("organization_id", organizationId)
}
