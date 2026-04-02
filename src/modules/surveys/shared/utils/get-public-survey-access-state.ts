import type { SurveyRow } from "@/modules/surveys/shared/types/db"

export type PublicSurveyAccessState = "accessible" | "draft" | "closed" | "unavailable"

export function getPublicSurveyAccessState(params: { survey: SurveyRow; now?: Date }): PublicSurveyAccessState {
	const { survey } = params
	const now = params.now ?? new Date()

	if (survey.status === "draft") {
		return "draft"
	}

	if (survey.status === "closed") {
		return "closed"
	}

	if (survey.visibility !== "public") {
		return "unavailable"
	}

	const startsAt = survey.starts_at ? new Date(survey.starts_at) : null
	const endsAt = survey.ends_at ? new Date(survey.ends_at) : null

	if ((startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime()))) {
		return "unavailable"
	}

	if (startsAt && startsAt > now) {
		return "unavailable"
	}

	if (endsAt && endsAt < now) {
		return "unavailable"
	}

	if (survey.status !== "published") {
		return "unavailable"
	}

	return "accessible"
}
