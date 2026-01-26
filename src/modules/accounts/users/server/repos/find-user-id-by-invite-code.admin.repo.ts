// @/modules/accounts/users/server/repos/find-user-id-by-invite-code.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function findUserIdByInviteCodeAdminRepo({ inviteCode }: { inviteCode: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("id").eq("invite_code", inviteCode).limit(1).maybeSingle()
}
