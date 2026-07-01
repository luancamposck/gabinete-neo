// @/modules/fleet/server/repos/list-pending-driver-applications.repo.ts
import { createClient } from "@/lib/supabase/server"

export type PendingDriverApplicationRow = {
	id: string
	plate: string
	vehicle_type: string
	vehicle_model: string | null
	vehicle_year: number | null
	vehicle_color: string | null
	crlv_document_path: string
	cnh_document_path: string
	created_at: string
	candidate: {
		id: string
		name: string
		email: string
	} | null
}

export async function listPendingDriverApplicationsRepo(params: { organizationId: string }) {
	const supabase = await createClient()

	return supabase
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
