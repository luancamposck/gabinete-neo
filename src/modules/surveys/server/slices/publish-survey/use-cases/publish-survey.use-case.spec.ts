import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { countSurveyQuestionsService } from "@/modules/surveys/server/services/count-survey-questions.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { publishSurveyService } from "@/modules/surveys/server/services/publish-survey.service"
import { publishSurveyUseCase } from "@/modules/surveys/server/slices/publish-survey/use-cases/publish-survey.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"

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

vi.mock("@/modules/surveys/server/services/count-survey-questions.service", () => ({
	countSurveyQuestionsService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id.service", () => ({
	findSurveyByIdService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/publish-survey.service", () => ({
	publishSurveyService: vi.fn()
}))

const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedHasMembershipPermissionService = vi.mocked(hasMembershipPermissionService)
const mockedGetMembershipByOrgAndUserIdWithRoleService = vi.mocked(getMembershipByOrgAndUserIdWithRoleService)
const mockedGetOrganizationByIdService = vi.mocked(getOrganizationByIdService)
const mockedCountSurveyQuestionsService = vi.mocked(countSurveyQuestionsService)
const mockedFindSurveyByIdService = vi.mocked(findSurveyByIdService)
const mockedPublishSurveyService = vi.mocked(publishSurveyService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>
type GetOrganizationByIdServiceRes = Awaited<ReturnType<typeof getOrganizationByIdService>>
type GetMembershipByOrgAndUserIdWithRoleServiceRes = Awaited<ReturnType<typeof getMembershipByOrgAndUserIdWithRoleService>>

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "9fb46f2e-720b-4f03-af5c-9db91dde5ffd",
		organization_id: "719b5a71-4d55-48f0-b0d1-748ccbbec3f8",
		title: "Pesquisa trimestral",
		description: null,
		status: "draft",
		visibility: "public",
		accept_anonymous_answers: true,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "87fb8578-b9ef-418c-9100-a2f0e0f8a29f",
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

describe("publishSurveyUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("rejects publishing surveys without at least one question", async () => {
		const survey = buildSurveyRow()

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("87fb8578-b9ef-418c-9100-a2f0e0f8a29f"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess(survey.organization_id))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "OWNER" }))
		mockedFindSurveyByIdService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey }
		})
		mockedCountSurveyQuestionsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { count: 0 }
		})

		const result = await publishSurveyUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})

		expect(result).toEqual({
			success: false,
			message: "A pesquisa precisa de pelo menos uma pergunta antes da publicação.",
			code: "min_questions_required"
		})
		expect(mockedPublishSurveyService).not.toHaveBeenCalled()
	})

	it("publishes a draft survey for a permitted manager", async () => {
		const survey = buildSurveyRow()
		const publishedSurvey = buildSurveyRow({ status: "published" })

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("87fb8578-b9ef-418c-9100-a2f0e0f8a29f"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess(survey.organization_id))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "MEMBER" }))
		mockedHasMembershipPermissionService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { allowed: true }
		})
		mockedFindSurveyByIdService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey }
		})
		mockedCountSurveyQuestionsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { count: 3 }
		})
		mockedPublishSurveyService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey: publishedSurvey }
		})

		const result = await publishSurveyUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})

		expect(mockedHasMembershipPermissionService).toHaveBeenCalledWith({
			organizationId: survey.organization_id,
			userId: "87fb8578-b9ef-418c-9100-a2f0e0f8a29f",
			permissionKey: "surveys.manage"
		})
		expect(mockedPublishSurveyService).toHaveBeenCalledWith({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})
		expect(result).toEqual({
			success: true,
			message: "Pesquisa publicada com sucesso.",
			data: { survey: publishedSurvey }
		})
	})
})
