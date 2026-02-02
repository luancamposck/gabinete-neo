// @/modules/auth/server/repos/update-password.repo.ts
import { createClient } from "@/lib/supabase/server"

export async function updatePasswordRepo({ newPassword }: { newPassword: string }) {
	const supabase = await createClient()

	return supabase.auth.updateUser({
		password: newPassword
	})
}
