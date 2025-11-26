import { createAdminClient } from "@/lib/supabase/admin"

export async function createAuthUserAdminRepo(createAuthUserParams: { email: string; password: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.auth.admin.createUser({
		email: createAuthUserParams.email,
		password: createAuthUserParams.password,
		email_confirm: true
	})
}

export async function deleteAuthUserAdminRepo({ authUserId }: { authUserId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.auth.admin.deleteUser(authUserId)
}
