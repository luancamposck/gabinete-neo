import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/shared/types/supabase"

type SubmitSurveyResponseRepoParams = {
	responseId: string
	surveyId: string
	organizationId: string | null
	respondentUserId: string | null
	respondentName: string | null
	respondentEmail: string | null
	respondentPhone: string | null
	isAnonymous: boolean
	responderFingerprintHash: string | null
	submittedAt: string
	answers: Json
}

export async function submitSurveyResponseRepo(params: SubmitSurveyResponseRepoParams) {
	const supabase = await createClient()

	return supabase.rpc("submit_survey_response", {
		p_response_id: params.responseId,
		p_survey_id: params.surveyId,
		p_organization_id: params.organizationId,
		p_respondent_user_id: params.respondentUserId,
		p_respondent_name: params.respondentName,
		p_respondent_email: params.respondentEmail,
		p_respondent_phone: params.respondentPhone,
		p_is_anonymous: params.isAnonymous,
		p_responder_fingerprint_hash: params.responderFingerprintHash,
		p_submitted_at: params.submittedAt,
		p_answers: params.answers
	})
}
