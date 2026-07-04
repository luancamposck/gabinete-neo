// @/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/shared/types/supabase"

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

export async function listOrganizationMembersWithProfileAndRoleByOrganizationIdAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
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
