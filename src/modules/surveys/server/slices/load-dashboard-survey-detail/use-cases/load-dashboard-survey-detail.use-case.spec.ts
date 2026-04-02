import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { loadDashboardSurveyDetailUseCase } from "@/modules/surveys/server/slices/load-dashboard-survey-detail/use-cases/load-dashboard-survey-detail.use-case"
import { getRequestHost } from "@/shared/http/get-request-host"

vi.mock("@/modules/auth/server/services/get-current-auth-user.service", () => ({
	getCurrentAuthUserService: vi.fn()
}))

vi.mock("@/modules/organizations/memberships/server/services/is-user-member-of-organization.service", () => ({
	isUserMemberOfOrganizationService: vi.fn()
}))

vi.mock("@/modules/organizations/server/services/get-organization-id-by-app-domain.service", () => ({
	getOrganizationIdByAppDomainService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id.service", () => ({
	findSurveyByIdService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/list-survey-questions-with-options.service", () => ({
	listSurveyQuestionsWithOptionsService: vi.fn()
}))

vi.mock("@/shared/http/get-request-host", () => ({
	getRequestHost: vi.fn()
}))

const mockedFindSurveyByIdService = vi.mocked(findSurveyByIdService)
const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedGetOrganizationIdByAppDomainService = vi.mocked(getOrganizationIdByAppDomainService)
const mockedGetRequestHost = vi.mocked(getRequestHost)
const mockedIsUserMemberOfOrganizationService = vi.mocked(isUserMemberOfOrganizationService)
const mockedListSurveyQuestionsWithOptionsService = vi.mocked(listSurveyQuestionsWithOptionsService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>

function buildAuthSuccess(userId: string): GetCurrentAuthUserServiceRes {
	return {
		success: true,
		message: "ok",
		data: { user: { id: userId } as User }
	}
}

describe("loadDashboardSurveyDetailUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("dddddddd-dddd-4ddd-8ddd-dddddddddddd"))
		mockedGetRequestHost.mockResolvedValue("tenant.example.com")
		mockedGetOrganizationIdByAppDomainService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { organizationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }
		})
		mockedListSurveyQuestionsWithOptionsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { questions: [] }
		})
	})

	it("returns not_member before trying to read the survey when membership is inactive", async () => {
		mockedIsUserMemberOfOrganizationService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { isMember: false, isActive: false }
		})

		const result = await loadDashboardSurveyDetailUseCase({
			surveyId: "99999999-9999-4999-8999-999999999999"
		})

		expect(result).toEqual({
			success: false,
			message: "Você precisa ter vínculo ativo com essa organização para acessar a pesquisa.",
			code: "not_member"
		})
		expect(mockedFindSurveyByIdService).not.toHaveBeenCalled()
		expect(mockedListSurveyQuestionsWithOptionsService).not.toHaveBeenCalled()
	})
})
