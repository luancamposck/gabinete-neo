// src/repositories/user-profiles/user-profiles.repo.ts
import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { UserProfileUpdate } from "@/types/domain/users/user-profile.types"

export async function updateUserProfileRepo({ userId, update }: { userId: string; update: UserProfileUpdate }): Promise<PostgrestSingleResponse<{ user_id: string }>> {
	const supabase = await createClient()

	return supabase.from("user_profiles").update(update).eq("user_id", userId).select("user_id").single()
}
