// @/modules/users/server/repos/select-user-id-by-email.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { SelectUserIdByEmailAdminRepoParams } from "../../shared/types/slices/lookup-user-id-by-email.types"

export async function selectUserIdByEmailAdminRepo(params: SelectUserIdByEmailAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("id").eq("email", params.email).limit(1).maybeSingle()
}
