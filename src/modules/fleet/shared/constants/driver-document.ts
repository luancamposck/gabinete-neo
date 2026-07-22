// @/modules/fleet/shared/constants/driver-document.ts

// ============================================================
// Documentos de motorista (CRLV / CNH)
//
// MIME de imagem/PDF, tamanho máximo de 10 MB por arquivo.
// ============================================================
export const MAX_DRIVER_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024

export const DRIVER_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const
