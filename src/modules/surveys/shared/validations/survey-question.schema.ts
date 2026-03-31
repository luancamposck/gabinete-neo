import { z } from "zod"

export const surveyQuestionTypeSchema = z.enum(["single_choice", "textarea", "checkbox", "ranking"])

const surveyQuestionOptionSchema = z.object({
	id: z.string().uuid().optional(),
	label: z.string().trim().min(1).max(120),
	value: z.string().trim().min(1).max(120),
	position: z.number().int().min(0)
})

const surveyQuestionConfigSchema = z.unknown().default({})

export const surveyQuestionSchema = z
	.object({
		id: z.string().uuid().optional(),
		title: z.string().trim().min(3).max(200),
		description: z.string().trim().max(1200).nullable().optional(),
		type: surveyQuestionTypeSchema,
		required: z.boolean().default(false),
		position: z.number().int().min(0),
		configJson: surveyQuestionConfigSchema.optional(),
		options: z.array(surveyQuestionOptionSchema).default([])
	})
	.superRefine((question, ctx) => {
		const requiresOptions = question.type === "single_choice" || question.type === "checkbox" || question.type === "ranking"

		if (requiresOptions && question.options.length < 2) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Questões objetivas, checkbox e ranking precisam de pelo menos 2 opções.",
				path: ["options"]
			})
		}

		if (question.type === "textarea" && question.options.length > 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Questão discursiva não pode conter opções.",
				path: ["options"]
			})
		}
	})

export const surveyQuestionsSchema = z.array(surveyQuestionSchema)

export type SurveyQuestionSchemaData = z.infer<typeof surveyQuestionSchema>
export type SurveyQuestionsSchemaData = z.infer<typeof surveyQuestionsSchema>
