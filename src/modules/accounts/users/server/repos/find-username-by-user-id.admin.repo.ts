// @/modules/accounts/users/server/repos/find-username-by-user-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function findUsernameByUserIdAdminRepo({ userId }: { userId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("username").eq("id", userId).limit(1).maybeSingle()
}
