// @/modules/organizations/server/slices/upload-organization-og-image/actions/upload-organization-og-image.action.ts
"use server"

import { uploadOrganizationOgImageUseCase } from "@/modules/organizations/server/slices/upload-organization-og-image/use-cases/upload-organization-og-image.use-case"
import { uploadOrganizationOgImageSchema } from "@/modules/organizations/shared/validations/upload-organization-og-image.schema"
import { getPublicAssetUrl } from "@/shared/storage/get-public-asset-url"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type UploadOrganizationOgImageActionRes = {
	path: string
	imageUrl: string | null
}

type UploadOrganizationOgImageCode = "unauthenticated" | "org_not_found" | "not_allowed" | "invalid_file" | "infra_error"

const INVALID_INPUT_MESSAGE = "Arquivo inválido. Verifique o arquivo e tente novamente."

export async function uploadOrganizationOgImageAction(formData: FormData): OperationResponse<UploadOrganizationOgImageActionRes, UploadOrganizationOgImageCode> {
	const parsed = uploadOrganizationOgImageSchema.safeParse({
		file: formData.get("file")
	})

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			code: "invalid_file",
			message: INVALID_INPUT_MESSAGE
		}
	}

	const uploadRes = await uploadOrganizationOgImageUseCase({
		file: parsed.data.file
	})

	if (uploadRes.success === false) return uploadRes

	let imageUrl: string | null = null

	try {
		imageUrl = await getPublicAssetUrl({ path: uploadRes.data.path })
	} catch (error) {
		console.error("[uploadOrganizationOgImageAction]: failed to resolve public URL", error)
	}

	return {
		success: true,
		message: uploadRes.message,
		data: {
			path: uploadRes.data.path,
			imageUrl
		}
	}
}
