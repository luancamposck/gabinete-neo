// @/modules/fleet/server/repos/insert-driver-application.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { InsertDriverApplicationAdminRepoParams } from "../../shared/types/slices/create-driver-application.types"

export async function insertDriverApplicationAdminRepo(params: InsertDriverApplicationAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("driver_applications").insert(params).select("id").single()
}
