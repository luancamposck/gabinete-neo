import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function listDriversWithMemberAndOriginApplicationByOrganizationIdAdminRepo(params: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("drivers")
		.select(
			`
			id,
			plate,
			vehicle_type,
			is_active,
			created_at,
			member:users!drivers_user_id_fkey (
				id,
				name,
				email
			),
			origin_application:driver_applications!drivers_driver_application_id_fkey (
				reviewed_at
			)
		`
		)
		.eq("organization_id", params.organizationId)
		.order("created_at", { ascending: false })
		.order("id", { ascending: true })
}
