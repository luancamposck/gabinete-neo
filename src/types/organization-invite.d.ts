// src/types/organization-invite.ts
import type { Tables } from "@/lib/definitions/supabase"

export type OrganizationInvite = Tables<"organization_invites">

export type OrganizationInviteWithRequestedUser = OrganizationInvite & {
	requested_user: {
		id: string
		name: string | null
		email: string
	} | null
}
