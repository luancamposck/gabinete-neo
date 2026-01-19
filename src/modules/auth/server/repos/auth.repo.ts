// @/modules/auth/server/repos/auth.repo.ts
import { createClient } from "@/lib/supabase/server"

export async function signInRepo({ email, password }: { email: string; password: string }) {
	const supabase = await createClient()

	return await supabase.auth.signInWithPassword({
		email,
		password
	})
}
