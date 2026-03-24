import { createClient } from "@/lib/supabase/server"

export async function listMembersWithCityByOrganizationIdRepo({ organizationId }: { organizationId: string }) {
	const supabase = await createClient()

	return supabase
		.from("organization_memberships")
		.select(
			`
			user:users!organization_memberships_user_id_fkey (
				id,
				name,
				profile:user_profiles!inner(
					city,
					state
				)
			)
		`
		)
		.eq("organization_id", organizationId)
}
