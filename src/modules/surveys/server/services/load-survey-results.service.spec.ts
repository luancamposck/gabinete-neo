import { beforeEach, describe, expect, it, vi } from "vitest"

import { listSurveyResultsAdminRepo } from "@/modules/surveys/server/repos/list-survey-results.admin.repo"
import { loadSurveyResultsService } from "@/modules/surveys/server/services/load-survey-results.service"

vi.mock("@/modules/surveys/server/repos/list-survey-results.admin.repo", () => ({
	listSurveyResultsAdminRepo: vi.fn()
}))

const mockedListSurveyResultsAdminRepo = vi.mocked(listSurveyResultsAdminRepo)

type ListSurveyResultsAdminRepoRes = Awaited<ReturnType<typeof listSurveyResultsAdminRepo>>

describe("loadSurveyResultsService", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("aggregates objective, ranking, and textarea results into DTOs", async () => {
		mockedListSurveyResultsAdminRepo.mockResolvedValue({
			data: [
				{
					id: "question-choice",
					title: "Escolha uma opcao",
					description: null,
					type: "single_choice",
					required: true,
					position: 1,
					survey_question_options: [
						{ id: "choice-1", label: "A", value: "a", position: 1 },
						{ id: "choice-2", label: "B", value: "b", position: 2 }
					],
					survey_response_items: [
						{ response_id: "r1", answer_option_ids_json: ["choice-1"], answer_ranking_json: null },
						{ response_id: "r2", answer_option_ids_json: ["choice-2"], answer_ranking_json: null }
					],
					survey_response_items_safe: []
				},
				{
					id: "question-ranking",
					title: "Ordene as prioridades",
					description: null,
					type: "ranking",
					required: true,
					position: 2,
					survey_question_options: [
						{ id: "rank-1", label: "Primeiro", value: "first", position: 1 },
						{ id: "rank-2", label: "Segundo", value: "second", position: 2 }
					],
					survey_response_items: [
						{ response_id: "r1", answer_option_ids_json: null, answer_ranking_json: ["rank-1", "rank-2"] },
						{ response_id: "r2", answer_option_ids_json: null, answer_ranking_json: ["rank-2", "rank-1"] }
					],
					survey_response_items_safe: []
				},
				{
					id: "question-text",
					title: "Comentario final",
					description: null,
					type: "textarea",
					required: false,
					position: 3,
					survey_question_options: [],
					survey_response_items: [],
					survey_response_items_safe: [
						{
							response_id: "r2",
							answer_text: "Resposta mais recente",
							submitted_at: "2026-04-02T12:00:00.000Z",
							is_anonymous: true,
							respondent_user_id: null,
							respondent_name: null,
							respondent_email: null,
							respondent_phone: null
						},
						{
							response_id: "r1",
							answer_text: "Resposta anterior",
							submitted_at: "2026-04-02T09:00:00.000Z",
							is_anonymous: false,
							respondent_user_id: "user-1",
							respondent_name: "Ana",
							respondent_email: "ana@example.com",
							respondent_phone: "5511999999999"
						}
					]
				}
			],
			error: null,
			count: null,
			status: 200,
			statusText: "OK"
		} as ListSurveyResultsAdminRepoRes)

		const result = await loadSurveyResultsService({ surveyId: "survey-1" })

		expect(result.success).toBe(true)
		if (result.success === false) {
			throw new Error("Expected successful result")
		}

		expect(result.data.questions).toEqual([
			{
				questionId: "question-choice",
				title: "Escolha uma opcao",
				description: null,
				type: "single_choice",
				required: true,
				position: 1,
				totalResponses: 2,
				textAnswers: [],
				options: [
					{
						optionId: "choice-1",
						label: "A",
						value: "a",
						position: 1,
						responseCount: 1,
						percentage: 50,
						averageRank: null
					},
					{
						optionId: "choice-2",
						label: "B",
						value: "b",
						position: 2,
						responseCount: 1,
						percentage: 50,
						averageRank: null
					}
				]
			},
			{
				questionId: "question-ranking",
				title: "Ordene as prioridades",
				description: null,
				type: "ranking",
				required: true,
				position: 2,
				totalResponses: 2,
				textAnswers: [],
				options: [
					{
						optionId: "rank-1",
						label: "Primeiro",
						value: "first",
						position: 1,
						responseCount: 2,
						percentage: 100,
						averageRank: 1.5
					},
					{
						optionId: "rank-2",
						label: "Segundo",
						value: "second",
						position: 2,
						responseCount: 2,
						percentage: 100,
						averageRank: 1.5
					}
				]
			},
			{
				questionId: "question-text",
				title: "Comentario final",
				description: null,
				type: "textarea",
				required: false,
				position: 3,
				totalResponses: 2,
				options: [],
				textAnswers: [
					{
						responseId: "r2",
						answerText: "Resposta mais recente",
						submittedAt: "2026-04-02T12:00:00.000Z",
						isAnonymous: true,
						respondent: {
							respondentUserId: null,
							respondentName: null,
							respondentEmail: null,
							respondentPhone: null
						}
					},
					{
						responseId: "r1",
						answerText: "Resposta anterior",
						submittedAt: "2026-04-02T09:00:00.000Z",
						isAnonymous: false,
						respondent: {
							respondentUserId: "user-1",
							respondentName: "Ana",
							respondentEmail: "ana@example.com",
							respondentPhone: "5511999999999"
						}
					}
				]
			}
		])
	})
})
