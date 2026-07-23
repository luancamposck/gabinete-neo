// ============= USE-CASE =============

export interface GetAddDriverApplicationContextUseCaseData {
	candidates: {
		userId: string
		name: string
		username: string
		email: string
		status: "available" | "already_driver" | "pending"
	}[]
}

export type GetAddDriverApplicationContextUseCaseCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "generic_error"

// ============= ACTION =============

export type GetAddDriverApplicationContextActionData = GetAddDriverApplicationContextUseCaseData

export type GetAddDriverApplicationContextActionCodes = GetAddDriverApplicationContextUseCaseCodes
