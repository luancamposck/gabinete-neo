// ============= REPO =============

export interface CreateSignedDocumentUrlAdminRepoParams {
	path: string
	expiresIn?: number
}

// ============= SERVICE =============

export interface CreateDriverDocumentSignedUrlServiceParams {
	path: string
}

export interface CreateDriverDocumentSignedUrlServiceData {
	signedUrl: string
}

export type CreateDriverDocumentSignedUrlServiceCodes = "generic_error"

// ============= ACTION =============

// No Actions here
