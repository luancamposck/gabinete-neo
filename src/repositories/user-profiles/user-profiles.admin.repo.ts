import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { TablesInsert } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

export type UserProfileInsert = TablesInsert<"user_profiles">

export async function insertUserProfileAdminRepo(insertUserProfileParams: UserProfileInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("user_profiles").insert(insertUserProfileParams).select("user_id").single()
}
