// src/repositories/organization-tasks/organization-tasks.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { OrganizationTaskInsert, OrganizationTaskRow } from "@/types/domain/tasks/organization-tasks.types"

export async function insertOrganizationTaskRepo({ task }: { task: OrganizationTaskInsert }): Promise<PostgrestSingleResponse<Pick<OrganizationTaskRow, "id">>> {
	const supabase = await createClient()

	return supabase.from("organization_tasks").insert(task).select("id").single()
}

// ------------------------------------------------------
// Listar tasks de uma organização, já com o usuário criador
// ------------------------------------------------------

export async function listOrganizationTasksWithCreatorByOrganizationIdRepo({ organizationId }: { organizationId: string }) {
	const supabase = await createClient()

	return supabase
		.from("organization_tasks")
		.select(
			`
      id,
      title,
      description,
      status,
      due_at,
      created_at,
      created_by:users!organization_tasks_created_by_user_id_fkey (
        id,
        name,
        email
      )
    `
		)
		.eq("organization_id", organizationId)
		.order("created_at", { ascending: false })
}
