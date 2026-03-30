import { z } from "zod"

export const publishSurveyActionSchema = z.object({
	organizationId: z.string().uuid(),
	surveyId: z.string().uuid()
})

export type PublishSurveyActionInput = z.infer<typeof publishSurveyActionSchema>
