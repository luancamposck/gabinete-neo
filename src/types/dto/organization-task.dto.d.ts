// src/types/dto/organization-task.dto.ts

import type { OrganizationTaskStatus } from "@/types/domain/tasks/organization-tasks.types"

/**
 * DTO pensado para consumo em UI (data-table, actions, etc.).
 * Campos em camelCase e dados “achatados”.
 */
export interface OrganizationTaskDTO {
	id: string
	title: string
	description: string | null
	status: OrganizationTaskStatus
	dueAt: string | null
	createdAt: string
	createdByName: string | null
	createdByEmail: string | null
}
