import { notFound, redirect } from "next/navigation"
import { getCreateSurveyContextAction } from "@/modules/surveys/server/slices/get-create-survey-context/actions/get-create-survey-context.action"
import { CreateSurveyForm } from "@/modules/surveys/shared/ui/create-survey-form"

const NewDashboardSurveyPage = async () => {
	const contextRes = await getCreateSurveyContextAction()

	if (contextRes.success === false) {
		switch (contextRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_allowed": {
				return notFound()
			}

			default: {
				throw new Error(contextRes.message)
			}
		}
	}

	return <CreateSurveyForm organizationId={contextRes.data.organization.id} organizationName={contextRes.data.organization.name} />
}

export default NewDashboardSurveyPage
