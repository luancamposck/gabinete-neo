// @/modules/users/server/repos/select-user-id-by-username.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { SelectUserIdByUsernameAdminRepoParams } from "../../shared/types/slices/check-username-available.types"

export async function selectUserIdByUsernameAdminRepo(params: SelectUserIdByUsernameAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("id").eq("username", params.username).limit(1).maybeSingle()
}
