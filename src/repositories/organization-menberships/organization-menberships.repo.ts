// src/repositories/organization-menberships/organization-menberships.repo.ts
import "server-only"

import { createClient } from "@/lib/supabase/server"

export async function findOrganizationMembershipByUserRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase.from("organization_memberships").select("*").eq("user_id", userId).eq("is_active", true).maybeSingle()
}

// ---------------------- Casos de uso para tables ----------------------
export async function listOrganizationMembersByOrganizationIdRepo({ organizationId }: { organizationId: string }) {
	const supabase = await createClient()

	return supabase
		.from("organization_memberships")
		.select(
			`
      organization_id,
      user_id,
      role,
      is_active,
      created_at,
      updated_at,
      invited_by_user_id,
      user:users!organization_memberships_user_id_fkey (
        id,
        name,
        email,
        profile:user_profiles!user_profiles_user_id_fkey (
          phone,
          cep,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          created_at
        )
      )
    `
		)
		.eq("organization_id", organizationId)
		.eq("is_active", true)
		.order("created_at", { ascending: true })
}
