import { createClient } from "@/lib/supabase/server"

export async function findUserWithProfileRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase
		.from("users")
		.select(`
      *,
      user_profiles!inner(*)
    `)
		.eq("id", userId)
		.maybeSingle()
}
