import { createClient } from "@/lib/supabase/server"

export async function requestPasswordResetRepo({ email }: { email: string }) {
	const supabase = await createClient()

	return supabase.auth.resetPasswordForEmail(email)
}
