import { listPublicSurveysRepo } from "@/modules/surveys/server/repos/list-public-surveys.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível listar as pesquisas públicas. Tente novamente mais tarde."
const OK_MESSAGE = "Pesquisas públicas listadas com sucesso."
const prefixLog = "[listPublicSurveysService]:"

export async function listPublicSurveysService(params: { organizationId: string }): OperationResponse<{ surveys: SurveyRow[] }, "infra_error"> {
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

		return {
			success: true,
			message: OK_MESSAGE,
			data: {
				surveys: data ?? []
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
