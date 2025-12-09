// src/types/domain/organization/organization-members-with-user-profile.types.ts
import type { OrganizationMembershipsRow } from "./organization-memberships-base.types"

export interface OrganizationMemberWithUserProfile extends OrganizationMembershipsRow {
	user: {
		id: string
		name: string | null
		email: string
		profile: {
			phone: string | null
			cep: string | null
			street: string | null
			number: string | null
			complement: string | null
			neighborhood: string | null
			city: string | null
			state: string | null
			created_at: string
		} | null
	} | null
}
