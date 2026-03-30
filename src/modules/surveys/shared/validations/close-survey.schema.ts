import { z } from "zod"

export const closeSurveyActionSchema = z.object({
	organizationId: z.string().uuid(),
	surveyId: z.string().uuid()
})

export type CloseSurveyActionInput = z.infer<typeof closeSurveyActionSchema>
