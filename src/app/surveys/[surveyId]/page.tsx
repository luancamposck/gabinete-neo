import { loadPublicSurveyDetailAction } from "@/modules/surveys/server/slices/load-public-survey-detail/actions/load-public-survey-detail.action"
import { PublicSurveyDetailErrorState, PublicSurveyDetailView } from "@/modules/surveys/shared/ui/public-survey-detail-view"

type PublicSurveyPageProps = {
	params: Promise<{
		surveyId: string
	}>
}

export const dynamic = "force-dynamic"

const ERROR_TITLES: Record<string, string> = {
	invalid_input: "Link de pesquisa inválido",
	org_not_found: "Organização não identificada",
	survey_not_found: "Pesquisa não encontrada",
	survey_cross_tenant: "Pesquisa fora do tenant atual",
	survey_draft: "Pesquisa ainda não publicada",
	survey_closed: "Pesquisa encerrada",
	survey_unavailable: "Pesquisa indisponível",
	infra_error: "Falha ao carregar pesquisa"
}

const PublicSurveyPage = async ({ params }: PublicSurveyPageProps) => {
	const { surveyId } = await params

	const surveyRes = await loadPublicSurveyDetailAction({ surveyId })
	if (surveyRes.success === false) {
		return <PublicSurveyDetailErrorState title={ERROR_TITLES[surveyRes.code ?? "infra_error"] ?? "Não foi possível carregar a pesquisa"} description={surveyRes.message} />
	}

	return <PublicSurveyDetailView survey={surveyRes.data.survey} />
}

export default PublicSurveyPage
