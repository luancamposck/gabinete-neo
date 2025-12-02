import { createClient } from "@/lib/supabase/server";

export async function signInAuthUserRepo({ email, password }: { email: string; password: string }) {
	const supabase = await createClient()

	return await supabase.auth.signInWithPassword({
		email,
		password
	})
}

export async function getCurrentAuthUserRepo() {
  const supabase = await createClient()

  return supabase.auth.getUser() // { data: { user }, error }
}
