// ============= SERVICE =============

export interface ListActiveOrgMembersByOrgIdServiceData {
	members: {
		userId: string
		name: string
		username: string
		email: string
	}[]
}
