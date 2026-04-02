import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { countSurveyResponsesService } from "@/modules/surveys/server/services/count-survey-responses.service"
import { deleteSurveyQuestionsBySurveyIdService } from "@/modules/surveys/server/services/delete-survey-questions-by-survey-id.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { insertSurveyQuestionOptionsService } from "@/modules/surveys/server/services/insert-survey-question-options.service"
import { insertSurveyQuestionsService } from "@/modules/surveys/server/services/insert-survey-questions.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { updateSurveyService } from "@/modules/surveys/server/services/update-survey.service"
import { updateSurveyUseCase } from "@/modules/surveys/server/slices/update-survey/use-cases/update-survey.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { SurveyQuestionSchemaData } from "@/modules/surveys/shared/validations/survey-question.schema"

vi.mock("@/modules/auth/server/services/get-current-auth-user.service", () => ({
	getCurrentAuthUserService: vi.fn()
}))

vi.mock("@/modules/auth/server/services/has-membership-permission.service", () => ({
	hasMembershipPermissionService: vi.fn()
}))

vi.mock("@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service", () => ({
	getMembershipByOrgAndUserIdWithRoleService: vi.fn()
}))

vi.mock("@/modules/organizations/server/services/get-organization-by-id.service", () => ({
	getOrganizationByIdService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/count-survey-responses.service", () => ({
	countSurveyResponsesService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/delete-survey-questions-by-survey-id.service", () => ({
	deleteSurveyQuestionsBySurveyIdService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id.service", () => ({
	findSurveyByIdService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/insert-survey-question-options.service", () => ({
	insertSurveyQuestionOptionsService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/insert-survey-questions.service", () => ({
	insertSurveyQuestionsService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/list-survey-questions-with-options.service", () => ({
	listSurveyQuestionsWithOptionsService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/update-survey.service", () => ({
	updateSurveyService: vi.fn()
}))

const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedGetMembershipByOrgAndUserIdWithRoleService = vi.mocked(getMembershipByOrgAndUserIdWithRoleService)
const mockedGetOrganizationByIdService = vi.mocked(getOrganizationByIdService)
const mockedCountSurveyResponsesService = vi.mocked(countSurveyResponsesService)
const mockedDeleteSurveyQuestionsBySurveyIdService = vi.mocked(deleteSurveyQuestionsBySurveyIdService)
const mockedFindSurveyByIdService = vi.mocked(findSurveyByIdService)
const mockedInsertSurveyQuestionOptionsService = vi.mocked(insertSurveyQuestionOptionsService)
const mockedInsertSurveyQuestionsService = vi.mocked(insertSurveyQuestionsService)
const mockedListSurveyQuestionsWithOptionsService = vi.mocked(listSurveyQuestionsWithOptionsService)
const mockedUpdateSurveyService = vi.mocked(updateSurveyService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>
type GetOrganizationByIdServiceRes = Awaited<ReturnType<typeof getOrganizationByIdService>>
type GetMembershipByOrgAndUserIdWithRoleServiceRes = Awaited<ReturnType<typeof getMembershipByOrgAndUserIdWithRoleService>>

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "838915f1-f969-4d50-9a9c-f4228c6aa74e",
		organization_id: "e07cf787-716d-4f52-a7a1-0f2e35a72b79",
		title: "Pesquisa interna",
		description: "Descricao",
		status: "draft",
		visibility: "private",
		accept_anonymous_answers: false,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "a8f524fd-87df-4b8b-ad9c-e45b79304973",
		...overrides
	}
}

function buildIncomingQuestions(): SurveyQuestionSchemaData[] {
	return [
		{
			id: "bf784d13-a78a-4b15-a8bc-6dcd2cc3c2ea",
			title: "Nova pergunta",
			description: null,
			type: "single_choice",
			required: true,
			position: 1,
			configJson: {},
			options: [
				{ label: "Opcao A", value: "a", position: 1 },
				{ label: "Opcao B", value: "b", position: 2 }
			]
		}
	]
}

function buildAuthSuccess(userId: string): GetCurrentAuthUserServiceRes {
	return {
		success: true,
		message: "ok",
		data: { user: { id: userId } as User }
	}
}

function buildOrganizationSuccess(organizationId: string): GetOrganizationByIdServiceRes {
	return {
		success: true,
		message: "ok",
		data: {
			organization: { id: organizationId }
		}
	} as GetOrganizationByIdServiceRes
}

function buildMembershipSuccess(params: { isActive: boolean; roleName: string }): GetMembershipByOrgAndUserIdWithRoleServiceRes {
	return {
		success: true,
		message: "ok",
		data: params
	}
}

describe("updateSurveyUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("blocks structural edits after the first response", async () => {
		const survey = buildSurveyRow()

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("a8f524fd-87df-4b8b-ad9c-e45b79304973"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess(survey.organization_id))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "OWNER" }))
		mockedFindSurveyByIdService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey }
		})
		mockedCountSurveyResponsesService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { count: 1 }
		})
		mockedListSurveyQuestionsWithOptionsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: {
				questions: [
					{
						id: "persisted-question",
						title: "Pergunta original",
						description: null,
						type: "single_choice",
						required: true,
						position: 1,
						config_json: {},
						survey_question_options: [
							{ id: "option-1", label: "Opcao A", value: "a", position: 1 },
							{ id: "option-2", label: "Opcao B", value: "b", position: 2 }
						]
					}
				]
			}
		})

		const result = await updateSurveyUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id,
			updates: {
				title: "Novo titulo",
				questions: buildIncomingQuestions()
			}
		})

		expect(result).toEqual({
			success: false,
			message: "A estrutura da pesquisa não pode ser alterada após a primeira resposta.",
			code: "survey_locked_after_response"
		})
		expect(mockedUpdateSurveyService).not.toHaveBeenCalled()
		expect(mockedDeleteSurveyQuestionsBySurveyIdService).not.toHaveBeenCalled()
		expect(mockedInsertSurveyQuestionsService).not.toHaveBeenCalled()
		expect(mockedInsertSurveyQuestionOptionsService).not.toHaveBeenCalled()
	})
})
