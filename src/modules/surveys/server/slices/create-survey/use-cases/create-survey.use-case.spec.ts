import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { createSurveyWithQuestionsService } from "@/modules/surveys/server/services/create-survey-with-questions.service"
import { createSurveyUseCase } from "@/modules/surveys/server/slices/create-survey/use-cases/create-survey.use-case"
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

vi.mock("@/modules/surveys/server/services/create-survey-with-questions.service", () => ({
	createSurveyWithQuestionsService: vi.fn()
}))

const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedHasMembershipPermissionService = vi.mocked(hasMembershipPermissionService)
const mockedGetMembershipByOrgAndUserIdWithRoleService = vi.mocked(getMembershipByOrgAndUserIdWithRoleService)
const mockedGetOrganizationByIdService = vi.mocked(getOrganizationByIdService)
const mockedCreateSurveyWithQuestionsService = vi.mocked(createSurveyWithQuestionsService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>
type GetOrganizationByIdServiceRes = Awaited<ReturnType<typeof getOrganizationByIdService>>
type GetMembershipByOrgAndUserIdWithRoleServiceRes = Awaited<ReturnType<typeof getMembershipByOrgAndUserIdWithRoleService>>

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "72a5ccbb-0cab-4e5f-bfa7-b2c36ef58939",
		organization_id: "0de63d17-48ca-46cc-bd43-1657ea11cd08",
		title: "Pesquisa de satisfacao",
		description: "Avalie o atendimento",
		status: "draft",
		visibility: "public",
		accept_anonymous_answers: true,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "2af8f4e9-a901-4d2c-9a7c-f7d7b1da530a",
		...overrides
	}
}

function buildQuestions(): SurveyQuestionSchemaData[] {
	return [
		{
			title: "Como voce avalia o atendimento?",
			description: null,
			type: "single_choice",
			required: true,
			position: 1,
			configJson: {},
			options: [
				{ label: "Bom", value: "good", position: 1 },
				{ label: "Ruim", value: "bad", position: 2 }
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

describe("createSurveyUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("returns not_allowed when an active member lacks surveys.manage", async () => {
		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("2af8f4e9-a901-4d2c-9a7c-f7d7b1da530a"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess("0de63d17-48ca-46cc-bd43-1657ea11cd08"))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "MEMBER" }))
		mockedHasMembershipPermissionService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { allowed: false }
		})

		const result = await createSurveyUseCase({
			organizationId: "0de63d17-48ca-46cc-bd43-1657ea11cd08",
			title: "Pesquisa de satisfacao",
			description: "Avalie o atendimento",
			visibility: "public",
			acceptAnonymousAnswers: true,
			startsAt: null,
			endsAt: null,
			questions: buildQuestions()
		})

		expect(result).toEqual({
			success: false,
			message: "Você não tem permissão para criar pesquisas nesta organização.",
			code: "not_allowed"
		})
		expect(mockedCreateSurveyWithQuestionsService).not.toHaveBeenCalled()
	})

	it("allows owner members to create surveys without a permission lookup", async () => {
		const survey = buildSurveyRow()

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("2af8f4e9-a901-4d2c-9a7c-f7d7b1da530a"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess("0de63d17-48ca-46cc-bd43-1657ea11cd08"))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "OWNER" }))
		mockedCreateSurveyWithQuestionsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey }
		})

		const questions = buildQuestions()
		const result = await createSurveyUseCase({
			organizationId: survey.organization_id,
			title: survey.title,
			description: survey.description,
			visibility: survey.visibility,
			acceptAnonymousAnswers: survey.accept_anonymous_answers,
			startsAt: survey.starts_at,
			endsAt: survey.ends_at,
			questions
		})

		expect(mockedHasMembershipPermissionService).not.toHaveBeenCalled()
		expect(mockedCreateSurveyWithQuestionsService).toHaveBeenCalledWith({
			organizationId: survey.organization_id,
			createdByUserId: "2af8f4e9-a901-4d2c-9a7c-f7d7b1da530a",
			title: survey.title,
			description: survey.description,
			visibility: survey.visibility,
			acceptAnonymousAnswers: survey.accept_anonymous_answers,
			startsAt: survey.starts_at,
			endsAt: survey.ends_at,
			questions
		})
		expect(result).toEqual({
			success: true,
			message: "Pesquisa criada com sucesso.",
			data: { survey }
		})
	})
})
