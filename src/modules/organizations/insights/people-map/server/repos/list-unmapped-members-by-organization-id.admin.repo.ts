import { createAdminClient } from "@/lib/supabase/admin"

export async function listUnmappedMembersByOrganizationIdAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("organization_memberships")
		.select(
			`
			user:users!organization_memberships_user_id_fkey (
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
