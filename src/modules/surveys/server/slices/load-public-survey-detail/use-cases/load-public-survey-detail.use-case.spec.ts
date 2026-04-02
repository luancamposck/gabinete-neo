import { beforeEach, describe, expect, it, vi } from "vitest"

import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { findSurveyByIdAdminService } from "@/modules/surveys/server/services/find-survey-by-id-admin.service"
import { listSurveyQuestionsWithOptionsAdminService } from "@/modules/surveys/server/services/list-survey-questions-with-options-admin.service"
import { loadPublicSurveyDetailUseCase } from "@/modules/surveys/server/slices/load-public-survey-detail/use-cases/load-public-survey-detail.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import { getRequestHost } from "@/shared/http/get-request-host"

vi.mock("@/modules/organizations/server/services/get-organization-id-by-app-domain.service", () => ({
	getOrganizationIdByAppDomainService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id-admin.service", () => ({
	findSurveyByIdAdminService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/list-survey-questions-with-options-admin.service", () => ({
	listSurveyQuestionsWithOptionsAdminService: vi.fn()
}))

vi.mock("@/shared/http/get-request-host", () => ({
	getRequestHost: vi.fn()
}))

const mockedFindSurveyByIdAdminService = vi.mocked(findSurveyByIdAdminService)
const mockedGetOrganizationIdByAppDomainService = vi.mocked(getOrganizationIdByAppDomainService)
const mockedGetRequestHost = vi.mocked(getRequestHost)
const mockedListSurveyQuestionsWithOptionsAdminService = vi.mocked(listSurveyQuestionsWithOptionsAdminService)

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "99999999-9999-4999-8999-999999999999",
		organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
		title: "Pesquisa publica",
		description: null,
		status: "published",
		visibility: "public",
		accept_anonymous_answers: true,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
		...overrides
	}
}

describe("loadPublicSurveyDetailUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()

		mockedGetRequestHost.mockResolvedValue("tenant.example.com")
		mockedGetOrganizationIdByAppDomainService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { organizationId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }
		})
		mockedListSurveyQuestionsWithOptionsAdminService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { questions: [] }
		})
	})

	it("rejects surveys from another tenant even when admin lookup finds the row", async () => {
		mockedFindSurveyByIdAdminService.mockResolvedValue({
			success: true,
			message: "ok",
			data: {
				survey: buildSurveyRow({
					organization_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
				})
			}
		})

		const result = await loadPublicSurveyDetailUseCase({
			surveyId: "99999999-9999-4999-8999-999999999999"
		})

		expect(result).toEqual({
			success: false,
			message: "Esta pesquisa não pertence à organização atual.",
			code: "survey_cross_tenant"
		})
		expect(mockedListSurveyQuestionsWithOptionsAdminService).not.toHaveBeenCalled()
	})
})
