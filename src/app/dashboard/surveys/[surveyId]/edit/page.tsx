import { notFound, redirect } from "next/navigation"
import { getManageSurveyContextAction } from "@/modules/surveys/server/slices/get-manage-survey-context/actions/get-manage-survey-context.action"
import { ManageSurveyForm } from "@/modules/surveys/shared/ui/manage-survey-form"

type EditDashboardSurveyPageProps = {
	params: Promise<{
		surveyId: string
	}>
}

export const dynamic = "force-dynamic"

const EditDashboardSurveyPage = async ({ params }: EditDashboardSurveyPageProps) => {
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

	return <ManageSurveyForm organization={contextRes.data.organization} survey={contextRes.data.survey} isStructureLocked={contextRes.data.isStructureLocked} />
}

export default EditDashboardSurveyPage
