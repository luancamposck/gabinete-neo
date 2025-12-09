// src/repositories/organization-tasks/organization-tasks.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { OrganizationTaskInsert, OrganizationTaskRow } from "@/types/domain/tasks/organization-tasks.types"

export async function insertOrganizationTaskRepo({ task }: { task: OrganizationTaskInsert }): Promise<PostgrestSingleResponse<Pick<OrganizationTaskRow, "id">>> {
	const supabase = await createClient()

	return supabase.from("organization_tasks").insert(task).select("id").single()
}
