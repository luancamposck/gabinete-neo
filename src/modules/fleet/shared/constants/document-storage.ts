// @/modules/fleet/shared/constants/document-storage.ts

export const FLEET_DOCUMENTS_BUCKET = "fleet-documents"

// 30min: revisão de candidaturas pode levar mais que os 5min originais sem expirar o link.
// 30min = 30 * 60 = 1800s
export const DOCUMENT_SIGNED_URL_TTL_SECONDS = 30 * 60
