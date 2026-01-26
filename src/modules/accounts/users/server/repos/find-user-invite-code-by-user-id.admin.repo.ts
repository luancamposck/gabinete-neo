// @/modules/accounts/users/server/repos/find-user-invite-code-by-user-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function findUserInviteCodeByUserIdAdminRepo({ userId }: { userId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("invite_code").eq("id", userId).limit(1).maybeSingle()
}
