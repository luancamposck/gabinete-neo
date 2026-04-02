import type { SurveyQuestionOptionRow, SurveyQuestionRow, SurveyQuestionType, SurveyResponseRow, SurveyRow, SurveyStatus, SurveyVisibility } from "@/modules/surveys/shared/types/db"
import type { Json } from "@/shared/types/supabase"

export type SurveySummaryDTO = {
	id: string
	organizationId: string
	title: string
	description: string | null
	status: SurveyStatus
	visibility: SurveyVisibility
	startsAt: string | null
	endsAt: string | null
	acceptAnonymousAnswers: boolean
	createdAt: string
	updatedAt: string
	createdByUserId: string
}

export type SurveyPublicListItemDTO = Pick<SurveySummaryDTO, "id" | "title" | "description" | "status" | "visibility" | "startsAt" | "endsAt" | "acceptAnonymousAnswers">

export type SurveyDashboardListItemDTO = Pick<SurveySummaryDTO, "id" | "title" | "description" | "status" | "visibility" | "startsAt" | "endsAt" | "acceptAnonymousAnswers" | "createdAt" | "updatedAt">

export type SurveyListItemDTO = SurveySummaryDTO

export type SurveyQuestionOptionDTO = {
	id: string
	label: string
	value: string
	position: number
}

export type SurveyQuestionDTO = {
	id: string
	title: string
	description: string | null
	type: SurveyQuestionType
	required: boolean
	position: number
	configJson: Json
	options: SurveyQuestionOptionDTO[]
}

export type SurveyDetailDTO = SurveySummaryDTO & {
	questions: SurveyQuestionDTO[]
}

export type SurveyPublicDetailDTO = Pick<SurveySummaryDTO, "id" | "title" | "description" | "status" | "visibility" | "startsAt" | "endsAt" | "acceptAnonymousAnswers"> & {
	questions: SurveyQuestionDTO[]
}

export type SurveyPublicRespondentIdentityDTO = {
	respondentName: string | null
	respondentEmail: string | null
	respondentPhone: string | null
}

export type SurveyResponseDTO = {
	id: string
	surveyId: string
	organizationId: string | null
	respondentUserId: string | null
	isAnonymous: boolean
	submittedAt: string
	respondent: SurveyPublicRespondentIdentityDTO
}

export type SurveyResultOptionDTO = {
	optionId: string
	label: string
	value: string
	position: number
	responseCount: number
	percentage: number | null
	averageRank: number | null
}

export type SurveyResultQuestionDTO = {
	questionId: string
	title: string
	description: string | null
	type: SurveyQuestionType
	required: boolean
	position: number
	totalResponses: number
	textAnswers: string[]
	options: SurveyResultOptionDTO[]
}

export type SurveyResultsDTO = {
	surveyId: string
	totalResponses: number
	questions: SurveyResultQuestionDTO[]
}

type SurveyQuestionWithOptionsRow = Pick<SurveyQuestionRow, "id" | "title" | "description" | "type" | "required" | "position" | "config_json"> & {
	survey_question_options: Pick<SurveyQuestionOptionRow, "id" | "label" | "value" | "position">[]
}

export function mapSurveyRowToSurveySummaryDTO(survey: SurveyRow): SurveySummaryDTO {
	return {
		id: survey.id,
		organizationId: survey.organization_id,
		title: survey.title,
		description: survey.description,
		status: survey.status,
		visibility: survey.visibility,
		startsAt: survey.starts_at,
		endsAt: survey.ends_at,
		acceptAnonymousAnswers: survey.accept_anonymous_answers,
		createdAt: survey.created_at,
		updatedAt: survey.updated_at,
		createdByUserId: survey.created_by_user_id
	}
}

export function mapSurveyRowToSurveyPublicListItemDTO(survey: SurveyRow): SurveyPublicListItemDTO {
	return {
		id: survey.id,
		title: survey.title,
		description: survey.description,
		status: survey.status,
		visibility: survey.visibility,
		startsAt: survey.starts_at,
		endsAt: survey.ends_at,
		acceptAnonymousAnswers: survey.accept_anonymous_answers
	}
}

export function mapSurveyRowToSurveyDashboardListItemDTO(survey: SurveyRow): SurveyDashboardListItemDTO {
	return {
		id: survey.id,
		title: survey.title,
		description: survey.description,
		status: survey.status,
		visibility: survey.visibility,
		startsAt: survey.starts_at,
		endsAt: survey.ends_at,
		acceptAnonymousAnswers: survey.accept_anonymous_answers,
		createdAt: survey.created_at,
		updatedAt: survey.updated_at
	}
}

export function mapSurveyQuestionWithOptionsToDTO(question: SurveyQuestionWithOptionsRow): SurveyQuestionDTO {
	return {
		id: question.id,
		title: question.title,
		description: question.description,
		type: question.type,
		required: question.required,
		position: question.position,
		configJson: question.config_json,
		options: question.survey_question_options.map((option) => ({
			id: option.id,
			label: option.label,
			value: option.value,
			position: option.position
		}))
	}
}

export function mapSurveyRowToSurveyDetailDTO(params: { survey: SurveyRow; questions?: SurveyQuestionDTO[] }): SurveyDetailDTO {
	return {
		...mapSurveyRowToSurveySummaryDTO(params.survey),
		questions: params.questions ?? []
	}
}

export function mapSurveyRowToSurveyPublicDetailDTO(params: { survey: SurveyRow; questions?: SurveyQuestionDTO[] }): SurveyPublicDetailDTO {
	return {
		id: params.survey.id,
		title: params.survey.title,
		description: params.survey.description,
		status: params.survey.status,
		visibility: params.survey.visibility,
		startsAt: params.survey.starts_at,
		endsAt: params.survey.ends_at,
		acceptAnonymousAnswers: params.survey.accept_anonymous_answers,
		questions: params.questions ?? []
	}
}

export function mapSurveyResponseRowToDTO(response: SurveyResponseRow): SurveyResponseDTO {
	return {
		id: response.id,
		surveyId: response.survey_id,
		organizationId: response.organization_id,
		respondentUserId: response.respondent_user_id,
		isAnonymous: response.is_anonymous,
		submittedAt: response.submitted_at,
		respondent: {
			respondentName: response.respondent_name,
			respondentEmail: response.respondent_email,
			respondentPhone: response.respondent_phone
		}
	}
}
