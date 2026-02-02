export type OrganizationWithMembershipView = {
	app_domain: string
	created_at: string
	created_by_user_id: string | null
	id: string
	is_active: boolean
	name: string
	slug: string
	updated_at: string

	organization_memberships: {
		created_at: string
		invited_by_user_id: string | null
		is_active: boolean
		organization_id: string
		role: string
		updated_at: string
		user_id: string
	}
}
