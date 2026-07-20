import type { Enums } from "@/shared/types/supabase"

// ============= REPO =============

export type ReviewDriverApplicationOperationParams = {
	applicationId: string
	reviewerUserId: string
}

export type ApproveDriverApplicationAdminRepoParams = ReviewDriverApplicationOperationParams

export type RejectDriverApplicationAdminRepoParams = ReviewDriverApplicationOperationParams

export interface ApproveDriverApplicationAdminRepoData {
	driver_id: string | null
	error_code: string | null
}

export interface GetDriverApplicationByIdAdminRepoData {
	id: string
	organization_id: string
	status: Enums<"driver_application_status">
}

// ============= SERVICE =============

export type ApproveDriverApplicationServiceParams = ReviewDriverApplicationOperationParams

export interface ApproveDriverApplicationServiceData {
	driverId: string
}

export type ApproveDriverApplicationServiceCodes = "not_found" | "already_reviewed" | "generic_error"

export type RejectDriverApplicationServiceParams = ReviewDriverApplicationOperationParams

export interface RejectDriverApplicationServiceData {
	applicationId: string
}

export type RejectDriverApplicationServiceCodes = "already_reviewed" | "generic_error"

export type GetDriverApplicationByIdServiceData = GetDriverApplicationByIdAdminRepoData

export type GetDriverApplicationByIdServiceCodes = "not_found" | "generic_error"

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
