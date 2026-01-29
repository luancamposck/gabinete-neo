// @/modules/auth/server/repos/sign-out.repo.ts

import { createClient } from "@/lib/supabase/server"

export async function signOutRepo() {
	const supabase = await createClient()

	return await supabase.auth.signOut()
}
