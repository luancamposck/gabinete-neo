export interface ApproveDriverApplicationAdminRepoParams {
	applicationId: string
	reviewerUserId: string
}

export interface ApproveDriverApplicationAdminRepoData {
	driver_id: string | null
	error_code: string | null
}

export interface ApproveDriverApplicationServiceParams {
	applicationId: string
	reviewerUserId: string
}

export interface ApproveDriverApplicationServiceData {
	driverId: string
}

export type ApproveDriverApplicationServiceCodes = "not_found" | "already_reviewed" | "generic_error"
