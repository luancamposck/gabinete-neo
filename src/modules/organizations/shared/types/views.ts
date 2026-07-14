import type { OrganizationRow, OrganizationUpdate } from "@/modules/organizations/shared/types/db"

export type OrganizationWithMembershipView = {
	app_domain: string
	created_at: string
	id: string
	is_active: boolean
	name: string
	description: string | null
	updated_at: string

	memberships: {
		created_at: string
		invited_by_user_id: string | null
		is_active: boolean
		organization_id: string
		role_id: string
		updated_at: string
		user_id: string
	}
}

export type OrganizationView = OrganizationRow
export type OrganizationUpdateView = OrganizationUpdate
