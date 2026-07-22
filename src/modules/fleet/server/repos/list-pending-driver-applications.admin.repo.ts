import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ListPendingDriverApplicationsAdminRepoParams } from "../../shared/types/slices/list-pending-driver-applications.types"

export async function listPendingDriverApplicationsAdminRepo(params: ListPendingDriverApplicationsAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("driver_applications")
		.select(
			`
			id,
			plate,
			vehicle_type,
			vehicle_model,
			vehicle_year,
			vehicle_color,
			crlv_document_path,
			cnh_document_path,
			created_at,
			candidate:users!driver_applications_user_id_fkey (
				id,
				name,
				email
			)
		`
		)
		.eq("organization_id", params.organizationId)
		.eq("status", "pending")
		.order("created_at", { ascending: true })
}
