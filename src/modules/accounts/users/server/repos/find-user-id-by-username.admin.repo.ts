// @/modules/accounts/users/server/repos/find-user-id-by-username.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function findUserIdByUsernameAdminRepo({ username }: { username: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("id").eq("username", username).limit(1).maybeSingle()
}
