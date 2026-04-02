import type { User } from "@supabase/supabase-js"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { findSurveyByIdAdminService } from "@/modules/surveys/server/services/find-survey-by-id-admin.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { submitSurveyResponseService } from "@/modules/surveys/server/services/submit-survey-response.service"
import { submitSurveyResponseUseCase } from "@/modules/surveys/server/slices/submit-survey-response/use-cases/submit-survey-response.use-case"
import { buildResponderFingerprintHash, ensureStableResponderCookie } from "@/modules/surveys/server/utils/responder-fingerprint"
import type { SurveyResponseRow, SurveyRow } from "@/modules/surveys/shared/types/db"
import { getRequestHost } from "@/shared/http/get-request-host"

vi.mock("@/modules/auth/server/services/get-current-auth-user.service", () => ({
	getCurrentAuthUserService: vi.fn()
}))

vi.mock("@/modules/organizations/memberships/server/services/is-user-member-of-organization.service", () => ({
	isUserMemberOfOrganizationService: vi.fn()
}))

vi.mock("@/modules/organizations/server/services/get-organization-by-id.service", () => ({
	getOrganizationByIdService: vi.fn()
}))

vi.mock("@/modules/organizations/server/services/get-organization-id-by-app-domain.service", () => ({
	getOrganizationIdByAppDomainService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/find-survey-by-id-admin.service", () => ({
	findSurveyByIdAdminService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/list-survey-questions-with-options.service", () => ({
	listSurveyQuestionsWithOptionsService: vi.fn()
}))

vi.mock("@/modules/surveys/server/services/submit-survey-response.service", () => ({
	submitSurveyResponseService: vi.fn()
}))

vi.mock("@/modules/surveys/server/utils/responder-fingerprint", () => ({
	buildResponderFingerprintHash: vi.fn(),
	ensureStableResponderCookie: vi.fn()
}))

vi.mock("@/shared/http/get-request-host", () => ({
	getRequestHost: vi.fn()
}))

const mockedBuildResponderFingerprintHash = vi.mocked(buildResponderFingerprintHash)
const mockedEnsureStableResponderCookie = vi.mocked(ensureStableResponderCookie)
const mockedFindSurveyByIdAdminService = vi.mocked(findSurveyByIdAdminService)
const mockedGetCurrentAuthUserService = vi.mocked(getCurrentAuthUserService)
const mockedGetOrganizationByIdService = vi.mocked(getOrganizationByIdService)
const mockedGetOrganizationIdByAppDomainService = vi.mocked(getOrganizationIdByAppDomainService)
const mockedGetRequestHost = vi.mocked(getRequestHost)
const mockedIsUserMemberOfOrganizationService = vi.mocked(isUserMemberOfOrganizationService)
const mockedListSurveyQuestionsWithOptionsService = vi.mocked(listSurveyQuestionsWithOptionsService)
const mockedSubmitSurveyResponseService = vi.mocked(submitSurveyResponseService)

type GetCurrentAuthUserServiceRes = Awaited<ReturnType<typeof getCurrentAuthUserService>>

function buildSurveyRow(overrides: Partial<SurveyRow> = {}): SurveyRow {
	return {
		id: "11111111-1111-4111-8111-111111111111",
		organization_id: "22222222-2222-4222-8222-222222222222",
		title: "Pesquisa publica",
		description: "Descricao",
		status: "published",
		visibility: "public",
		accept_anonymous_answers: true,
		starts_at: null,
		ends_at: null,
		created_at: "2026-04-02T10:00:00.000Z",
		updated_at: "2026-04-02T10:00:00.000Z",
		created_by_user_id: "33333333-3333-4333-8333-333333333333",
		...overrides
	}
}

function buildResponseRow(overrides: Partial<SurveyResponseRow> = {}): SurveyResponseRow {
	return {
		id: "44444444-4444-4444-8444-444444444444",
		survey_id: "11111111-1111-4111-8111-111111111111",
		organization_id: "22222222-2222-4222-8222-222222222222",
		respondent_user_id: null,
		respondent_name: null,
		respondent_email: null,
		respondent_phone: null,
		is_anonymous: false,
		responder_fingerprint_hash: "fingerprint-hash",
		submitted_at: "2026-04-02T12:00:00.000Z",
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

function buildUnauthenticated(): GetCurrentAuthUserServiceRes {
	return {
		success: false,
		message: "unauthenticated",
		code: "unauthenticated"
	} as GetCurrentAuthUserServiceRes
}

function buildQuestions() {
	return [
		{
			id: "55555555-5555-4555-8555-555555555555",
			title: "Como voce avalia o atendimento?",
			description: null,
			type: "single_choice" as const,
			required: true,
			position: 1,
			config_json: {},
			survey_question_options: [
				{
					id: "66666666-6666-4666-8666-666666666666",
					label: "Bom",
					value: "good",
					position: 1
				}
			]
		}
	]
}

describe("submitSurveyResponseUseCase", () => {
	beforeEach(() => {
		vi.clearAllMocks()

		mockedGetRequestHost.mockResolvedValue("tenant.example.com")
		mockedGetOrganizationIdByAppDomainService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { organizationId: "22222222-2222-4222-8222-222222222222" }
		})
		mockedFindSurveyByIdAdminService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { survey: buildSurveyRow() }
		})
		mockedListSurveyQuestionsWithOptionsService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { questions: buildQuestions() }
		})
		mockedEnsureStableResponderCookie.mockResolvedValue("stable-cookie-id")
		mockedBuildResponderFingerprintHash.mockResolvedValue("fingerprint-hash")
	})

	it("persists identified public responses with manual identity fields", async () => {
		const response = buildResponseRow({
			respondent_name: "Ada Lovelace",
			respondent_email: "ada@example.com",
			respondent_phone: "+55 11 99999-9999"
		})

		mockedGetCurrentAuthUserService.mockResolvedValue(buildUnauthenticated())
		mockedSubmitSurveyResponseService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { response }
		})

		const result = await submitSurveyResponseUseCase({
			surveyId: "11111111-1111-4111-8111-111111111111",
			isAnonymous: false,
			respondentName: " Ada Lovelace ",
			respondentEmail: " ada@example.com ",
			respondentPhone: " +55 11 99999-9999 ",
			answers: [
				{
					questionId: "55555555-5555-4555-8555-555555555555",
					answerOptionIds: ["66666666-6666-4666-8666-666666666666"]
				}
			]
		})

		expect(mockedSubmitSurveyResponseService).toHaveBeenCalledWith(
			expect.objectContaining({
				surveyId: "11111111-1111-4111-8111-111111111111",
				organizationId: "22222222-2222-4222-8222-222222222222",
				respondentUserId: null,
				respondentName: "Ada Lovelace",
				respondentEmail: "ada@example.com",
				respondentPhone: "+55 11 99999-9999",
				isAnonymous: false,
				responderFingerprintHash: "fingerprint-hash"
			})
		)
		expect(result).toEqual({
			success: true,
			message: "Resposta registrada com sucesso.",
			data: { response }
		})
	})

	it("persists anonymous public responses with identity fields cleared", async () => {
		const response = buildResponseRow({
			is_anonymous: true
		})

		mockedGetCurrentAuthUserService.mockResolvedValue(buildUnauthenticated())
		mockedSubmitSurveyResponseService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { response }
		})

		await submitSurveyResponseUseCase({
			surveyId: "11111111-1111-4111-8111-111111111111",
			isAnonymous: true,
			respondentName: "Should be ignored",
			respondentEmail: "ignored@example.com",
			respondentPhone: "+55 11 90000-0000",
			answers: [
				{
					questionId: "55555555-5555-4555-8555-555555555555",
					answerOptionIds: ["66666666-6666-4666-8666-666666666666"]
				}
			]
		})

		expect(mockedSubmitSurveyResponseService).toHaveBeenCalledWith(
			expect.objectContaining({
				respondentUserId: null,
				respondentName: null,
				respondentEmail: null,
				respondentPhone: null,
				isAnonymous: true,
				responderFingerprintHash: "fingerprint-hash"
			})
		)
	})

	it("allows authenticated active members to answer private surveys", async () => {
		const response = buildResponseRow({
			respondent_user_id: "77777777-7777-4777-8777-777777777777",
			responder_fingerprint_hash: null
		})

		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("77777777-7777-4777-8777-777777777777"))
		mockedFindSurveyByIdAdminService.mockResolvedValue({
			success: true,
			message: "ok",
			data: {
				survey: buildSurveyRow({
					visibility: "private",
					accept_anonymous_answers: false
				})
			}
		})
		mockedIsUserMemberOfOrganizationService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { isMember: true, isActive: true }
		})
		mockedSubmitSurveyResponseService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { response }
		})

		const result = await submitSurveyResponseUseCase({
			surveyId: "11111111-1111-4111-8111-111111111111",
			answers: [
				{
					questionId: "55555555-5555-4555-8555-555555555555",
					answerOptionIds: ["66666666-6666-4666-8666-666666666666"]
				}
			]
		})

		expect(mockedIsUserMemberOfOrganizationService).toHaveBeenCalledWith({
			organizationId: "22222222-2222-4222-8222-222222222222",
			userId: "77777777-7777-4777-8777-777777777777"
		})
		expect(mockedSubmitSurveyResponseService).toHaveBeenCalledWith(
			expect.objectContaining({
				respondentUserId: "77777777-7777-4777-8777-777777777777",
				responderFingerprintHash: null
			})
		)
		expect(result.success).toBe(true)
	})

	it("blocks private survey submissions from unauthenticated visitors", async () => {
		mockedGetCurrentAuthUserService.mockResolvedValue(buildUnauthenticated())
		mockedFindSurveyByIdAdminService.mockResolvedValue({
			success: true,
			message: "ok",
			data: {
				survey: buildSurveyRow({
					visibility: "private",
					accept_anonymous_answers: false
				})
			}
		})

		const result = await submitSurveyResponseUseCase({
			surveyId: "11111111-1111-4111-8111-111111111111",
			answers: [
				{
					questionId: "55555555-5555-4555-8555-555555555555",
					answerOptionIds: ["66666666-6666-4666-8666-666666666666"]
				}
			]
		})

		expect(result).toEqual({
			success: false,
			message: "Você não tem permissão para responder esta pesquisa no momento.",
			code: "not_allowed"
		})
		expect(mockedSubmitSurveyResponseService).not.toHaveBeenCalled()
	})

	it("maps duplicate submissions to already_answered", async () => {
		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("77777777-7777-4777-8777-777777777777"))
		mockedGetRequestHost.mockResolvedValue(null)
		mockedGetOrganizationByIdService.mockResolvedValue({
			success: true,
			message: "ok",
			data: {
				organization: {
					id: "22222222-2222-4222-8222-222222222222",
					app_domain: "tenant.example.com",
					created_at: "2026-04-02T10:00:00.000Z",
					created_by_user_id: null,
					description: null,
					image_path: null,
					is_active: true,
					name: "Tenant",
					slug: "tenant",
					updated_at: "2026-04-02T10:00:00.000Z"
				}
			}
		})
		mockedSubmitSurveyResponseService.mockResolvedValue({
			success: false,
			message: "duplicate",
			code: "already_answered"
		})

		const result = await submitSurveyResponseUseCase({
			surveyId: "11111111-1111-4111-8111-111111111111",
			organizationId: "22222222-2222-4222-8222-222222222222",
			answers: [
				{
					questionId: "55555555-5555-4555-8555-555555555555",
					answerOptionIds: ["66666666-6666-4666-8666-666666666666"]
				}
			]
		})

		expect(result).toEqual({
			success: false,
			message: "Você já respondeu esta pesquisa.",
			code: "already_answered"
		})
	})

	it("rejects answers that reference a question from another survey", async () => {
		mockedGetCurrentAuthUserService.mockResolvedValue(buildAuthSuccess("77777777-7777-4777-8777-777777777777"))
		mockedSubmitSurveyResponseService.mockResolvedValue({
			success: true,
			message: "ok",
			data: { response: buildResponseRow() }
		})

		const result = await submitSurveyResponseUseCase({
			surveyId: "11111111-1111-4111-8111-111111111111",
			answers: [
				{
					questionId: "88888888-8888-4888-8888-888888888888",
					answerOptionIds: ["66666666-6666-4666-8666-666666666666"]
				}
			]
		})

		expect(result).toEqual({
			success: false,
			message: "As respostas enviadas contêm uma questão que não pertence a esta pesquisa.",
			code: "invalid_answers"
		})
		expect(mockedSubmitSurveyResponseService).not.toHaveBeenCalled()
	})
})
