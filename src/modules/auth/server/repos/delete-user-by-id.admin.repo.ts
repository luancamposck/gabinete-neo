// @/modules/auth/server/repos/delete-user-by-id.admin.repo.ts
import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function deleteUserByIdAdminRepo({ userId }: { userId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.auth.admin.deleteUser(userId)
}
