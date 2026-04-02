import { z } from "zod"

export const loadSurveyResultsActionSchema = z.object({
	organizationId: z.string().uuid(),
	surveyId: z.string().uuid()
})
