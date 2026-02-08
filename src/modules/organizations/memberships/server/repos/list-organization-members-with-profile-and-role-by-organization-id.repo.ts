// @/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo.ts

import type { Database } from "@/lib/definitions/supabase"
import { createClient } from "@/lib/supabase/server"

type MembershipRow = Database["public"]["Tables"]["organization_memberships"]["Row"]
type UserRow = Database["public"]["Tables"]["users"]["Row"]
type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"]
type RoleRow = Database["public"]["Tables"]["roles"]["Row"]

export type OrganizationMemberWithUserProfileAndRole = MembershipRow & {
	user: UserRow & {
		profile: UserProfileRow
	}
	role: RoleRow
	invited_by_user: { name: string } | null
}

export async function listOrganizationMembersWithProfileAndRoleByOrganizationIdRepo({ organizationId }: { organizationId: string }) {
	const supabase = await createClient()

	return supabase
		.from("organization_memberships")
		.select(
			`
      *,
      user:users!organization_memberships_user_id_fkey (
        *,
        profile:user_profiles!inner(*)
      ),
      role:roles!organization_memberships_role_id_fkey (*),
      invited_by_user:users!organization_memberships_invited_by_user_id_fkey (
        name
      )
    `
		)
		.eq("organization_id", organizationId)
		.order("created_at", { ascending: true })
}
