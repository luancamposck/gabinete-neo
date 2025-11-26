import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { TablesInsert } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

export type PublicUserInsert = TablesInsert<"users">

export async function insertPublicUserAdminRepo(insertPublicUserParams: PublicUserInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").insert(insertPublicUserParams).select("id").single()
}

export async function deletePublicUserAdminRepo({ publicUserId }: { publicUserId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").delete().eq("id", publicUserId)
}
