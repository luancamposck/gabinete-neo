import { z } from "zod"
import { surveyAnswersInputSchema } from "@/modules/surveys/shared/validations/survey-response.schema"

export const submitSurveyResponseActionSchema = z.object({
	surveyId: z.string().uuid(),
	organizationId: z.string().uuid().nullable().optional(),
	isAnonymous: z.boolean().optional(),
	answers: surveyAnswersInputSchema
})
