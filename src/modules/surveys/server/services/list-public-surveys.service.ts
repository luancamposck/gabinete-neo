import { listPublicSurveysRepo } from "@/modules/surveys/server/repos/list-public-surveys.repo"
import { mapSurveyRowToSurveyPublicListItemDTO, type SurveyPublicListItemDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível listar as pesquisas públicas. Tente novamente mais tarde."
const OK_MESSAGE = "Pesquisas públicas listadas com sucesso."
const prefixLog = "[listPublicSurveysService]:"

function isSurveyCurrentlyAvailable(params: { startsAt: string | null; endsAt: string | null; now: Date }) {
	const startsAtDate = params.startsAt ? new Date(params.startsAt) : null
	const endsAtDate = params.endsAt ? new Date(params.endsAt) : null

	if (startsAtDate && Number.isNaN(startsAtDate.getTime())) {
		return false
	}

	if (endsAtDate && Number.isNaN(endsAtDate.getTime())) {
		return false
	}

	if (startsAtDate && startsAtDate > params.now) {
		return false
	}

	if (endsAtDate && endsAtDate < params.now) {
		return false
	}

	return true
}

export async function listPublicSurveysService(params: { organizationId: string }): OperationResponse<{ surveys: SurveyPublicListItemDTO[] }, "infra_error"> {
	try {
		const { data, error } = await listPublicSurveysRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		const now = new Date()
		const availableSurveys = (data ?? [])
			.filter((survey) =>
				isSurveyCurrentlyAvailable({
					startsAt: survey.starts_at,
					endsAt: survey.ends_at,
					now
				})
			)
			.map(mapSurveyRowToSurveyPublicListItemDTO)

		return {
			success: true,
			message: OK_MESSAGE,
			data: {
				surveys: availableSurveys
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR,
			code: "infra_error"
		}
	}
}
