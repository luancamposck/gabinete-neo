import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { closeSurveyService } from "@/modules/surveys/server/services/close-survey.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { closeSurveyUseCase } from "@/modules/surveys/server/slices/close-survey/use-cases/close-survey.use-case"
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

vi.mock("@/modules/surveys/server/services/close-survey.service", () => ({
	closeSurveyService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id.service", () => ({
	findSurveyByIdService: vi.fn()
}))

const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedHasMembershipPermissionService = vi.mocked(hasMembershipPermissionService)
const mockedGetMembershipByOrgAndUserIdWithRoleService = vi.mocked(getMembershipByOrgAndUserIdWithRoleService)
const mockedGetOrganizationByIdService = vi.mocked(getOrganizationByIdService)
const mockedCloseSurveyService = vi.mocked(closeSurveyService)
const mockedFindSurveyByIdService = vi.mocked(findSurveyByIdService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>
type GetOrganizationByIdServiceRes = Awaited<ReturnType<typeof getOrganizationByIdService>>
type GetMembershipByOrgAndUserIdWithRoleServiceRes = Awaited<ReturnType<typeof getMembershipByOrgAndUserIdWithRoleService>>

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "e92d0335-4ddb-44d1-98fe-50f721af1913",
		organization_id: "2f750464-a9d8-4ccb-b592-cb3dd30ce4a0",
		title: "Pesquisa anual",
		description: null,
		status: "published",
		visibility: "private",
		accept_anonymous_answers: false,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "abefee93-a225-499b-a803-bc292cd6b389",
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

describe("closeSurveyUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("rejects closing surveys that are not published", async () => {
		const survey = buildSurveyRow({ status: "draft" })

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("abefee93-a225-499b-a803-bc292cd6b389"))
		mockedGetOrganizationByIdService.mockResolvedValue(buildOrganizationSuccess(survey.organization_id))
		mockedGetMembershipByOrgAndUserIdWithRoleService.mockResolvedValue(buildMembershipSuccess({ isActive: true, roleName: "OWNER" }))
		mockedFindSurveyByIdService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey }
		})

		const result = await closeSurveyUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})

		expect(result).toEqual({
			success: false,
			message: "A pesquisa só pode ser encerrada quando estiver publicada.",
			code: "invalid_publication_state"
		})
		expect(mockedCloseSurveyService).not.toHaveBeenCalled()
	})

	it("closes a published survey for a permitted manager", async () => {
		const survey = buildSurveyRow()
		const closedSurvey = buildSurveyRow({ status: "closed" })

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("abefee93-a225-499b-a803-bc292cd6b389"))
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
		mockedCloseSurveyService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey: closedSurvey }
		})

		const result = await closeSurveyUseCase({
			organizationId: survey.organization_id,
			surveyId: survey.id
		})

		expect(mockedHasMembershipPermissionService).toHaveBeenCalledWith({
			organizationId: survey.organization_id,
			userId: "abefee93-a225-499b-a803-bc292cd6b389",
			permissionKey: "surveys.manage"
		})
		expect(result).toEqual({
			success: true,
			message: "Pesquisa encerrada com sucesso.",
			data: { survey: closedSurvey }
		})
	})
})
