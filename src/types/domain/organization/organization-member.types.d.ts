// src/types/domain/organization/organization-members.types.d.ts

import type { PublicUserRow } from "@/types/domain/users/user-base.types"
import type { OrganizationMembershipsRow } from "./organization-memberships-base.types"

/**
 * Membership de uma organização com os dados básicos do usuário joinados.
 *
 * Corresponde ao select:
 *  organization_id,
 *  user_id,
 *  role,
 *  is_active,
 *  created_at,
 *  user: users!organization_memberships_user_id_fkey (id, name, email)
 */
export interface OrganizationMemberWithUser {
	organization_id: OrganizationMembershipsRow["organization_id"]
	user_id: OrganizationMembershipsRow["user_id"]
	role_id: string
	is_active: OrganizationMembershipsRow["is_active"]
	created_at: OrganizationMembershipsRow["created_at"]

	user: Pick<PublicUserRow, "id" | "name" | "email">
}
