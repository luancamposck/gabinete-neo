import { notFound, redirect } from "next/navigation"
import { getManageSurveyContextAction } from "@/modules/surveys/server/slices/get-manage-survey-context/actions/get-manage-survey-context.action"
import { loadSurveyResultsAction } from "@/modules/surveys/server/slices/load-survey-results/actions/load-survey-results.action"
import { DashboardSurveyResultsView } from "@/modules/surveys/shared/ui/dashboard-survey-results-view"

type DashboardSurveyResultsPageProps = {
	params: Promise<{
		surveyId: string
	}>
}

export const dynamic = "force-dynamic"

const DashboardSurveyResultsPage = async ({ params }: DashboardSurveyResultsPageProps) => {
	const { surveyId } = await params

	const contextRes = await getManageSurveyContextAction({ surveyId })

	if (contextRes.success === false) {
		switch (contextRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_allowed":
			case "survey_not_found": {
				return notFound()
			}

			default: {
				throw new Error(contextRes.message)
			}
		}
	}

	const resultsRes = await loadSurveyResultsAction({
		organizationId: contextRes.data.organization.id,
		surveyId
	})

	if (resultsRes.success === false) {
		switch (resultsRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "organization_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_allowed":
			case "survey_not_found": {
				return notFound()
			}

			default: {
				throw new Error(resultsRes.message)
			}
		}
	}

	return <DashboardSurveyResultsView organization={contextRes.data.organization} survey={contextRes.data.survey} results={resultsRes.data.results} />
}

export default DashboardSurveyResultsPage
