// @/modules/auth/server/repos/auth.admin.repo.ts
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function insertAuthUserAdminRepo({ email, password }: { email: string; password: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.auth.admin.createUser({
		email,
		password,
		email_confirm: true
	})
}
