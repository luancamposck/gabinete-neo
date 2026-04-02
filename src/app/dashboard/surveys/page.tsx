import { getSidebarContextAction } from "@/modules/app-shell/server/slices/get-sidebar-context/actions/get-sidebar-context.action"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { listDashboardSurveysAction } from "@/modules/surveys/server/slices/list-dashboard-surveys/actions/list-dashboard-surveys.action"
import { DashboardSurveysListErrorState, DashboardSurveysListView } from "@/modules/surveys/shared/ui/dashboard-surveys-list-view"

export const dynamic = "force-dynamic"

const ERROR_TITLES: Record<string, string> = {
	org_not_found: "Organização não identificada",
	not_member: "Acesso indisponível para este tenant",
	infra_error: "Falha ao carregar pesquisas"
}

const DashboardSurveysPage = async () => {
	const [sidebarContextRes, surveysRes] = await Promise.all([getSidebarContextAction(), listDashboardSurveysAction()])

	if (sidebarContextRes.success === false) {
		return <DashboardSurveysListErrorState title={ERROR_TITLES[sidebarContextRes.code ?? "infra_error"] ?? "Não foi possível carregar o contexto"} description={sidebarContextRes.message} />
	}

	if (surveysRes.success === false) {
		return <DashboardSurveysListErrorState title={ERROR_TITLES[surveysRes.code ?? "infra_error"] ?? "Não foi possível carregar as pesquisas"} description={surveysRes.message} />
	}

	const canManageSurveys = sidebarContextRes.data.permissionKeys.includes(PERMISSIONS.SURVEYS_MANAGE)

	return <DashboardSurveysListView surveys={surveysRes.data.surveys} canManageSurveys={canManageSurveys} />
}

export default DashboardSurveysPage
