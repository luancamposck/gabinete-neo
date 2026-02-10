import { createAdminClient } from "@/lib/supabase/admin"

export function listPermissionsAdminRepo() {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("permissions").select("id,key,description").order("key", { ascending: true })
}
