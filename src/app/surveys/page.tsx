import { listPublicSurveysAction } from "@/modules/surveys/server/slices/list-public-surveys/actions/list-public-surveys.action"
import { PublicSurveysListErrorState, PublicSurveysListView } from "@/modules/surveys/shared/ui/public-surveys-list-view"

export const dynamic = "force-dynamic"

const ERROR_TITLES: Record<string, string> = {
	org_not_found: "Organização não identificada",
	infra_error: "Falha ao carregar pesquisas"
}

const PublicSurveysPage = async () => {
	const surveysRes = await listPublicSurveysAction()
	if (surveysRes.success === false) {
		return <PublicSurveysListErrorState title={ERROR_TITLES[surveysRes.code ?? "infra_error"] ?? "Não foi possível carregar as pesquisas"} description={surveysRes.message} />
	}

	return <PublicSurveysListView surveys={surveysRes.data.surveys} />
}

export default PublicSurveysPage
