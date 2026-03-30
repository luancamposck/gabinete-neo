import { z } from "zod"

export const updateSurveyActionSchema = z.object({
	organizationId: z.string().uuid(),
	surveyId: z.string().uuid(),
	title: z.string().trim().min(3).max(140).optional(),
	description: z.string().trim().max(2000).nullable().optional(),
	visibility: z.enum(["public", "private"]).optional(),
	acceptAnonymousAnswers: z.boolean().optional(),
	startsAt: z.string().datetime().nullable().optional(),
	endsAt: z.string().datetime().nullable().optional()
})

export type UpdateSurveyActionInput = z.infer<typeof updateSurveyActionSchema>
