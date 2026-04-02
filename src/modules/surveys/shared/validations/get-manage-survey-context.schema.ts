import { z } from "zod"

export const getManageSurveyContextActionSchema = z.object({
	surveyId: z.string().uuid()
})

export type GetManageSurveyContextActionInput = z.infer<typeof getManageSurveyContextActionSchema>
