type SurveyResponseAccessState = "accessible" | "draft" | "closed" | "unavailable"

type SurveyResponseAccessStateParams = {
	survey: {
		status: "draft" | "published" | "closed"
		startsAt: string | null
		endsAt: string | null
	}
	now?: Date
}

export function getSurveyResponseAccessState(params: SurveyResponseAccessStateParams): SurveyResponseAccessState {
	const { survey } = params
	const now = params.now ?? new Date()

	if (survey.status === "draft") {
		return "draft"
	}

	if (survey.status === "closed") {
		return "closed"
	}

	const startsAt = survey.startsAt ? new Date(survey.startsAt) : null
	const endsAt = survey.endsAt ? new Date(survey.endsAt) : null

	if ((startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime()))) {
		return "unavailable"
	}

	if (startsAt && startsAt > now) {
		return "unavailable"
	}

	if (endsAt && endsAt < now) {
		return "unavailable"
	}

	return survey.status === "published" ? "accessible" : "unavailable"
}
