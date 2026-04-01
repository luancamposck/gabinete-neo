import { z } from "zod"
import { surveyAnswersInputSchema } from "@/modules/surveys/shared/validations/survey-response.schema"

export const submitSurveyResponseActionSchema = z.object({
	surveyId: z.string().uuid(),
	organizationId: z.string().uuid().nullable().optional(),
	isAnonymous: z.boolean().optional(),
	respondentName: z.string().trim().min(1).max(255).nullable().optional(),
	respondentEmail: z.email().max(320).nullable().optional(),
	respondentPhone: z.string().trim().min(1).max(32).nullable().optional(),
	answers: surveyAnswersInputSchema
})
