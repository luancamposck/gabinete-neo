export type SurveyListItemDTO = {
	id: string
	organizationId: string
	title: string
	description: string | null
	status: "draft" | "published" | "closed"
	visibility: "public" | "private"
	startsAt: string | null
	endsAt: string | null
	acceptAnonymousAnswers: boolean
	createdAt: string
	updatedAt: string
	createdByUserId: string
}
