import { z } from "zod"

export const loadPublicSurveyDetailActionSchema = z.object({
	surveyId: z.string().uuid()
})
