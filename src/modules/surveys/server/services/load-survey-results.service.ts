import { listSurveyResultsAdminRepo } from "@/modules/surveys/server/repos/list-survey-results.admin.repo"
import type { SurveyQuestionType } from "@/modules/surveys/shared/types/db"
import type { SurveyResultOptionDTO, SurveyResultQuestionDTO, SurveyResultTextAnswerDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"
import type { Json } from "@/shared/types/supabase"

type SurveyResultQuestionRow = {
	id: string
	title: string
	description: string | null
	type: SurveyQuestionType
	required: boolean
	position: number
	survey_question_options: Array<{
		id: string
		label: string
		value: string
		position: number
	}>
	survey_response_items: Array<{
		response_id: string
		answer_option_ids_json: Json | null
		answer_ranking_json: Json | null
	}>
	survey_response_items_safe: Array<{
		response_id: string | null
		answer_text: string | null
		submitted_at: string | null
		is_anonymous: boolean | null
		respondent_user_id: string | null
		respondent_name: string | null
		respondent_email: string | null
		respondent_phone: string | null
	}>
}

const MSG_INFRA_ERROR = "Não foi possível carregar os resultados da pesquisa."

function parseStringArray(value: Json | null): string[] {
	if (!Array.isArray(value)) {
		return []
	}

	return value.filter((item): item is string => typeof item === "string")
}

function getOptionPercentage(optionCount: number, totalResponses: number): number | null {
	if (totalResponses < 1) {
		return null
	}

	return Number(((optionCount / totalResponses) * 100).toFixed(2))
}

function buildChoiceOptionResult(params: { option: SurveyResultQuestionRow["survey_question_options"][number]; answerSets: string[][]; totalResponses: number }): SurveyResultOptionDTO {
	const responseCount = params.answerSets.filter((answerOptionIds) => answerOptionIds.includes(params.option.id)).length

	return {
		optionId: params.option.id,
		label: params.option.label,
		value: params.option.value,
		position: params.option.position,
		responseCount,
		percentage: getOptionPercentage(responseCount, params.totalResponses),
		averageRank: null
	}
}

function buildRankingOptionResult(params: { option: SurveyResultQuestionRow["survey_question_options"][number]; rankings: string[][]; totalResponses: number }): SurveyResultOptionDTO {
	const ranks = params.rankings
		.map((ranking) => ranking.indexOf(params.option.id))
		.filter((rankIndex) => rankIndex >= 0)
		.map((rankIndex) => rankIndex + 1)

	const responseCount = ranks.length
	const averageRank = responseCount < 1 ? null : Number((ranks.reduce((sum, rank) => sum + rank, 0) / responseCount).toFixed(2))

	return {
		optionId: params.option.id,
		label: params.option.label,
		value: params.option.value,
		position: params.option.position,
		responseCount,
		percentage: getOptionPercentage(responseCount, params.totalResponses),
		averageRank
	}
}

function mapTextAnswer(item: SurveyResultQuestionRow["survey_response_items_safe"][number]): SurveyResultTextAnswerDTO | null {
	if (!item.response_id || item.answer_text === null || !item.submitted_at) {
		return null
	}

	return {
		responseId: item.response_id,
		answerText: item.answer_text,
		submittedAt: item.submitted_at,
		isAnonymous: item.is_anonymous ?? true,
		respondent: {
			respondentUserId: item.respondent_user_id,
			respondentName: item.respondent_name,
			respondentEmail: item.respondent_email,
			respondentPhone: item.respondent_phone
		}
	}
}

function mapQuestionToResults(question: SurveyResultQuestionRow): SurveyResultQuestionDTO {
	const orderedOptions = [...question.survey_question_options].sort((optionA, optionB) => optionA.position - optionB.position)
	const totalResponses = question.survey_response_items.length

	if (question.type === "textarea") {
		const textAnswers = question.survey_response_items_safe
			.map(mapTextAnswer)
			.filter((item): item is SurveyResultTextAnswerDTO => item !== null)
			.sort((answerA, answerB) => answerB.submittedAt.localeCompare(answerA.submittedAt))

		return {
			questionId: question.id,
			title: question.title,
			description: question.description,
			type: question.type,
			required: question.required,
			position: question.position,
			totalResponses: textAnswers.length,
			textAnswers,
			options: []
		}
	}

	if (question.type === "ranking") {
		const rankings = question.survey_response_items.map((item) => parseStringArray(item.answer_ranking_json))

		return {
			questionId: question.id,
			title: question.title,
			description: question.description,
			type: question.type,
			required: question.required,
			position: question.position,
			totalResponses,
			textAnswers: [],
			options: orderedOptions.map((option) => buildRankingOptionResult({ option, rankings, totalResponses }))
		}
	}

	const answerSets = question.survey_response_items.map((item) => parseStringArray(item.answer_option_ids_json))

	return {
		questionId: question.id,
		title: question.title,
		description: question.description,
		type: question.type,
		required: question.required,
		position: question.position,
		totalResponses,
		textAnswers: [],
		options: orderedOptions.map((option) => buildChoiceOptionResult({ option, answerSets, totalResponses }))
	}
}

export async function loadSurveyResultsService(params: { surveyId: string }): OperationResponse<{ questions: SurveyResultQuestionDTO[] }, "infra_error"> {
	const { data, error } = await listSurveyResultsAdminRepo(params)

	if (error) {
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Resultados da pesquisa carregados com sucesso.",
		data: {
			questions: ((data ?? []) as SurveyResultQuestionRow[]).map(mapQuestionToResults)
		}
	}
}
