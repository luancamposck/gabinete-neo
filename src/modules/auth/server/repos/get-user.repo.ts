// @/modules/auth/server/repos/get-user.repo.ts
import { createClient } from "@/lib/supabase/server"

export async function getCurrentAuthUserRepo() {
	const supabase = await createClient()

	return supabase.auth.getUser()
}
