// src/repositories/organization-menberships/organization-menberships.repo.ts
import "server-only"

import { createClient } from "@/lib/supabase/server"

export async function findOrganizationMembershipByUserRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase.from("organization_memberships").select("*").eq("user_id", userId).eq("is_active", true).maybeSingle()
}
