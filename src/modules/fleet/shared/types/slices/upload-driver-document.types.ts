// ============= REPO =============

export interface UploadDriverDocumentAdminRepoParams {
	organizationId: string
	userId: string
	file: File
	ext: string
}

export interface UploadDriverDocumentAdminRepoResult {
	path: string
}

// ============= SERVICE =============

export interface UploadDriverDocumentServiceParams {
	organizationId: string
	userId: string
	file: File
}

export interface UploadDriverDocumentServiceData {
	path: string
}

export type UploadDriverDocumentServiceCodes = "generic_error"

// ============= ACTION =============

// No Actions here
