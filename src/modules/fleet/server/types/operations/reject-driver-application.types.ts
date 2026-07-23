// ============= REPO =============

export interface RejectDriverApplicationAdminRepoParams {
	applicationId: string
	reviewerUserId: string
}

// ============= SERVICE =============

export interface RejectDriverApplicationServiceParams {
	applicationId: string
	reviewerUserId: string
}

export interface RejectDriverApplicationServiceData {
	applicationId: string
}

export type RejectDriverApplicationServiceCodes = "already_reviewed" | "generic_error"
