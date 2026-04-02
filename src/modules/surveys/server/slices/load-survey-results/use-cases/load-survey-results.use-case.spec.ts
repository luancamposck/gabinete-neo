import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { countSurveyResponsesAdminService } from "@/modules/surveys/server/services/count-survey-responses-admin.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { loadSurveyResultsService } from "@/modules/surveys/server/services/load-survey-results.service"
import { loadSurveyResultsUseCase } from "@/modules/surveys/server/slices/load-survey-results/use-cases/load-survey-results.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { SurveyResultQuestionDTO } from "@/modules/surveys/shared/types/dto"

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

vi.mock("@/modules/surveys/server/services/count-survey-responses-admin.service", () => ({
	countSurveyResponsesAdminService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id.service", () => ({
	findSurveyByIdService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/load-survey-results.service", () => ({
	loadSurveyResultsService: vi.fn()
}))

const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedHasMembershipPermissionService = vi.mocked(hasMembershipPermissionService)
const mockedGetMembershipByOrgAndUserIdWithRoleService = vi.mocked(getMembershipByOrgAndUserIdWithRoleService)
const mockedGetOrganizationByIdService = vi.mocked(getOrganizationByIdService)
const mockedCountSurveyResponsesAdminService = vi.mocked(countSurveyResponsesAdminService)
const mockedFindSurveyByIdService = vi.mocked(findSurveyByIdService)
const mockedLoadSurveyResultsService = vi.mocked(loadSurveyResultsService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>
type GetOrganizationByIdServiceRes = Awaited<ReturnType<typeof getOrganizationByIdService>>
type GetMembershipByOrgAndUserIdWithRoleServiceRes = Awaited<ReturnType<typeof getMembershipByOrgAndUserIdWithRoleService>>

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "ae609a7f-693c-4cbf-b2d1-aaaf40f9e659",
		organization_id: "dc5d668e-cd4d-4ea5-961e-83430c2fd2b7",
		title: "Pesquisa de clima",
		description: null,
		status: "published",
		visibility: "private",
		accept_anonymous_answers: false,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "1645be16-8c4e-4367-9592-5efc927a06b1",
		...overrides
	}
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

describe("loadSurveyResultsUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("returns not_allowed when the member lacks surveys.manage", async () => {
		const survey = buildSurveyRow()

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("1645be16-8c4e-4367-9592-5efc927a06b1"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess(survey.organization_id))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "MEMBER" }))
		mockedHasMembershipPermissionService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { allowed: false }
		})

		const result = await loadSurveyResultsUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})

		expect(result).toEqual({
			success: false,
			message: "Você não tem permissão para visualizar os resultados desta pesquisa.",
			code: "not_allowed"
		})
		expect(mockedLoadSurveyResultsService).not.toHaveBeenCalled()
		expect(mockedCountSurveyResponsesAdminService).not.toHaveBeenCalled()
	})

	it("returns aggregated results for authorized managers", async () => {
		const survey = buildSurveyRow()
		const questions: SurveyResultQuestionDTO[] = [
			{
				questionId: "question-1",
				title: "Pergunta",
				description: null,
				type: "single_choice",
				required: true,
				position: 1,
				totalResponses: 2,
				textAnswers: [],
				options: []
			}
		]

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("1645be16-8c4e-4367-9592-5efc927a06b1"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess(survey.organization_id))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "OWNER" }))
		mockedFindSurveyByIdService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey }
		})
		mockedLoadSurveyResultsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { questions }
		})
		mockedCountSurveyResponsesAdminService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { count: 2 }
		})

		const result = await loadSurveyResultsUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})

		expect(result).toEqual({
			success: true,
			message: "Resultados da pesquisa carregados com sucesso.",
			data: {
				results: {
					surveyId: survey.id,
					totalResponses: 2,
					questions
				}
			}
		})
	})
})
