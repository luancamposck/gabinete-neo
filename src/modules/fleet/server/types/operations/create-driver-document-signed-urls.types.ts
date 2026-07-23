export interface CreateSignedDocumentUrlsAdminRepoParams {
	paths: string[]
	expiresIn?: number
}

export interface CreateDriverDocumentSignedUrlsServiceParams {
	paths: string[]
}

export interface CreateDriverDocumentSignedUrlsServiceData {
	urlsByPath: Map<string, string | null>
}

export type CreateDriverDocumentSignedUrlsServiceCodes = "generic_error"
