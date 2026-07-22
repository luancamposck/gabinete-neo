// @/modules/users/profiles/server/repos/select-user-id-by-phone.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { SelectUserIdByPhoneAdminRepoParams } from "../../shared/types/slices/check-phone-available.types"

export async function selectUserIdByPhoneAdminRepo(params: SelectUserIdByPhoneAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("user_profiles").select("user_id").eq("phone", params.phone).limit(1).maybeSingle()
}
