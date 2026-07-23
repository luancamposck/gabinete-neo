export interface CreateSignedDocumentUrlAdminRepoParams {
	path: string
	expiresIn?: number
}

export interface CreateDriverDocumentSignedUrlServiceParams {
	path: string
}

export interface CreateDriverDocumentSignedUrlServiceData {
	signedUrl: string
}

export type CreateDriverDocumentSignedUrlServiceCodes = "generic_error"
