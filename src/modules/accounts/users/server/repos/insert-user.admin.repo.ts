// @/modules/accounts/users/server/repos/insert-user.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserInsert } from "@/modules/accounts/users/shared/types/db"

export async function insertUserAdminRepo(insertUserParams: UserInsert) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("users")
		.insert(insertUserParams as any)
		.select("id")
		.single()
}
