// ============= USE-CASE =============

export type ReviewDriverApplicationAction = "approve" | "reject"

export interface ReviewDriverApplicationUseCaseData {
	applicationId: string
	action: ReviewDriverApplicationAction
	driverId: string | null
}

export type ReviewDriverApplicationUseCaseCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "not_found" | "already_reviewed" | "generic_error"

// ============= ACTION =============

export interface ApproveDriverApplicationActionData {
	applicationId: string
	driverId: string | null
}

export type ApproveDriverApplicationActionCodes = ReviewDriverApplicationUseCaseCodes

export interface RejectDriverApplicationActionData {
	applicationId: string
}

export type RejectDriverApplicationActionCodes = ReviewDriverApplicationUseCaseCodes
