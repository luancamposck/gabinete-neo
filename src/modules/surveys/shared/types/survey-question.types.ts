import type { Json } from "@/shared/types/supabase"

export const SURVEY_QUESTION_TYPES = ["single_choice", "textarea", "checkbox", "ranking"] as const

export type SurveyQuestionType = (typeof SURVEY_QUESTION_TYPES)[number]

export type SurveyQuestionOptionInput = {
	id?: string
	label: string
	value: string
	position: number
}

export type SurveyQuestionInput = {
	id?: string
	title: string
	description?: string | null
	type: SurveyQuestionType
	required: boolean
	position: number
	configJson?: Json
	options: SurveyQuestionOptionInput[]
}

export type SurveyAnswerInput = {
	questionId: string
	answerText?: string | null
	answerOptionIds?: string[]
	answerRanking?: string[]
}
