import { z } from "zod"
import type { SurveyQuestionSchemaData } from "@/modules/surveys/shared/validations/survey-question.schema"

export const surveyAnswerInputSchema = z.object({
	questionId: z.string().uuid(),
	answerText: z.string().trim().max(5000).nullable().optional(),
	answerOptionIds: z.array(z.string().uuid()).optional(),
	answerRanking: z.array(z.string().uuid()).optional()
})

export const surveyAnswersInputSchema = z.array(surveyAnswerInputSchema)

export function validateSurveyAnswers(params: { questions: SurveyQuestionSchemaData[]; answers: z.infer<typeof surveyAnswersInputSchema> }) {
	const questionIds = new Set(params.questions.map((question) => question.id).filter((questionId): questionId is string => Boolean(questionId)))
	const answerByQuestionId = new Map(params.answers.map((answer) => [answer.questionId, answer]))

	for (const answer of params.answers) {
		if (!questionIds.has(answer.questionId)) {
			return { success: false as const, message: "As respostas enviadas contêm uma questão que não pertence a esta pesquisa." }
		}
	}

	for (const question of params.questions) {
		const answer = answerByQuestionId.get(question.id ?? "")
		const optionIds = new Set(question.options.map((option) => option.id).filter((optionId): optionId is string => Boolean(optionId)))

		if (question.required && !answer) {
			return { success: false as const, message: `A questão "${question.title}" é obrigatória.` }
		}

		if (!answer) {
			continue
		}

		if (question.type === "textarea") {
			const text = answer.answerText?.trim() ?? ""
			if (question.required && text.length === 0) {
				return { success: false as const, message: `A questão "${question.title}" exige uma resposta discursiva.` }
			}
		}

		if (question.type === "single_choice") {
			const selected = answer.answerOptionIds ?? []
			if (question.required && selected.length !== 1) {
				return { success: false as const, message: `A questão "${question.title}" exige apenas uma opção.` }
			}
			if (selected.length > 1) {
				return { success: false as const, message: `A questão "${question.title}" permite somente uma opção.` }
			}
			if (selected.some((optionId) => !optionIds.has(optionId))) {
				return { success: false as const, message: `A questão "${question.title}" contém opção inválida.` }
			}
		}

		if (question.type === "checkbox") {
			const selected = answer.answerOptionIds ?? []
			if (question.required && selected.length === 0) {
				return { success: false as const, message: `A questão "${question.title}" exige ao menos uma opção.` }
			}
			if (selected.some((optionId) => !optionIds.has(optionId))) {
				return { success: false as const, message: `A questão "${question.title}" contém opção inválida.` }
			}
		}

		if (question.type === "ranking") {
			const ranking = answer.answerRanking ?? []
			if (ranking.some((optionId) => !optionIds.has(optionId))) {
				return { success: false as const, message: `A questão "${question.title}" contém opções inválidas no ranking.` }
			}
			if (new Set(ranking).size !== ranking.length) {
				return { success: false as const, message: `A questão "${question.title}" não pode ter itens duplicados no ranking.` }
			}
			if (question.required && ranking.length !== optionIds.size) {
				return { success: false as const, message: `A questão "${question.title}" exige ordenação completa.` }
			}
		}
	}

	return { success: true as const }
}
