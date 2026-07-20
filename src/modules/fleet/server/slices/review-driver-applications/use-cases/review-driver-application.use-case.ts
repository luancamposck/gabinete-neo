import { reviewDriverApplicationUseCase as reviewDriverApplicationUseCaseFlat } from "@/modules/fleet/server/use-cases/review-driver-application.use-case"
import type { ReviewDriverApplicationAction, ReviewDriverApplicationUseCaseCodes, ReviewDriverApplicationUseCaseData } from "@/modules/fleet/shared/types/slices/review-driver-application.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"

type LegacyReviewDriverApplicationUseCaseCodes = Exclude<ReviewDriverApplicationUseCaseCodes, "generic_error"> | "infra_error"

export async function reviewDriverApplicationUseCase(params: {
	applicationId: string
	action: ReviewDriverApplicationAction
}): AppResultAsync<ReviewDriverApplicationUseCaseData, LegacyReviewDriverApplicationUseCaseCodes> {
	const result = await reviewDriverApplicationUseCaseFlat(params)

	if (result.success === false) {
		return {
			success: false,
			code: result.code === "generic_error" ? "infra_error" : result.code
		}
	}

	return result
}
