import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import type { PublicUserInsert, PublicUserRow } from "@/types/domain/users/user-base.types"

export async function insertPublicUserAdminRepo(insertPublicUserParams: PublicUserInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").insert(insertPublicUserParams).select("id").single()
}

export async function deletePublicUserAdminRepo({ publicUserId }: { publicUserId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").delete().eq("id", publicUserId)
}

export async function getPublicUserByUserIdAdminRepo({ userId }: { userId: string }): Promise<PostgrestSingleResponse<PublicUserRow>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("*").eq("id", userId).single()
}
