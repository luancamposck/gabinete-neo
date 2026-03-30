import { z } from "zod"

export const submitSurveyResponseActionSchema = z.object({
	surveyId: z.string().uuid(),
	organizationId: z.string().uuid().nullable().optional(),
	isAnonymous: z.boolean().optional()
})
