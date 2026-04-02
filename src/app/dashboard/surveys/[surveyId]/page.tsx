import { notFound, redirect } from "next/navigation"
import { loadDashboardSurveyDetailAction } from "@/modules/surveys/server/slices/load-dashboard-survey-detail/actions/load-dashboard-survey-detail.action"
import { DashboardSurveyDetailView } from "@/modules/surveys/shared/ui/dashboard-survey-detail-view"

type DashboardSurveyPageProps = {
	params: Promise<{
		surveyId: string
	}>
}

export const dynamic = "force-dynamic"

const DashboardSurveyPage = async ({ params }: DashboardSurveyPageProps) => {
	const { surveyId } = await params

	const surveyRes = await loadDashboardSurveyDetailAction({ surveyId })

	if (surveyRes.success === false) {
		switch (surveyRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_member":
			case "survey_not_found": {
				return notFound()
			}

			default: {
				throw new Error(surveyRes.message)
			}
		}
	}

	return <DashboardSurveyDetailView survey={surveyRes.data.survey} />
}

export default DashboardSurveyPage
