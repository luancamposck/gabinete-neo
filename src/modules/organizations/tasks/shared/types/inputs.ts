export type CreateOrganizationTaskParams = {
	organizationId: string
	title: string
	description?: string | null
	createdByUserId: string
	dueAt?: string | null
}

export type AddUsersToTaskParams = {
	organizationId: string
	taskId: string
	userIds: string[]
}
