import type { OrganizationTaskStatus } from "./db"

export type OrganizationTaskTableRow = {
	id: string
	title: string
	description: string | null
	status: OrganizationTaskStatus
	dueAt: string | null
	createdAt: string
	createdByName: string | null
	createdByEmail: string | null
}

export type AssignableUserForTask = {
	userId: string
	name: string
	email: string
	role: string
	isActive: boolean
}
