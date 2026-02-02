// @/modules/accounts/users/server/repos/update-user.repo.ts
import { createClient } from "@/lib/supabase/server"
import type { UserUpdate } from "@/modules/accounts/users/shared/types/db"

type UpdateUserRepoParams = {
	userId: string
	updates: UserUpdate
}

export async function updateUserRepo({ userId, updates }: UpdateUserRepoParams) {
	const supabase = await createClient()

	return supabase.from("users").update(updates).eq("id", userId).select("id").single()
}
