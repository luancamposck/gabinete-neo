// @/modules/accounts/users/profiles/server/repos/insert-profile.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserProfileInsert } from "@/modules/accounts/users/profiles/shared/types/db"

export async function insertUserProfileAdminRepo(insertParams: UserProfileInsert) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("user_profiles").insert(insertParams).select("user_id").single()
}
