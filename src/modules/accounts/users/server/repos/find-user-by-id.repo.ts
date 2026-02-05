// @/modules/accounts/users/server/repos/find-user-by-id.repo.ts

import { createClient } from "@/lib/supabase/server"

export async function findUserByIdRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase.from("users").select("*").eq("id", userId).limit(1).maybeSingle()
}
