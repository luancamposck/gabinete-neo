import { z } from "zod"
import { surveyQuestionsSchema } from "@/modules/surveys/shared/validations/survey-question.schema"

export const createSurveyActionSchema = z.object({
	organizationId: z.string().uuid(),
	title: z.string().trim().min(3).max(140),
	description: z.string().trim().max(2000).nullable().optional(),
	visibility: z.enum(["public", "private"]).default("private"),
	acceptAnonymousAnswers: z.boolean().default(false),
	startsAt: z.string().datetime().nullable().optional(),
	endsAt: z.string().datetime().nullable().optional(),
	questions: surveyQuestionsSchema.default([])
})

export type CreateSurveyActionInput = z.infer<typeof createSurveyActionSchema>
