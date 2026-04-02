import { z } from "zod"

export const loadDashboardSurveyDetailActionSchema = z.object({
	surveyId: z.string().uuid()
})
