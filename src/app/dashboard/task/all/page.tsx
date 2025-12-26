import { redirect } from "next/navigation"

import { getCurrentAuthUserAction } from "@/actions/auth/get-current-auth-user.action"
import { getOrganizationMembershipByUserIdAction } from "@/actions/organization-membership"

import { getTasksForTableAction } from "./sub-actions/get-tasks-for-table.action"
import { OrganizationTasksTable } from "./sub-components/data-table/organization-tasks-table"

const AllTasksPage = async () => {
	// 1) Pegar o usuário logado
	const getCurrentAuthUserActionRes = await getCurrentAuthUserAction()

	if (getCurrentAuthUserActionRes.success === false) {
		redirect("/")
	}

	const user = getCurrentAuthUserActionRes.data.user

	// 2) Pegar membership do user
	const getOrganizationMembershipByUserIdActionRes = await getOrganizationMembershipByUserIdAction({ userId: user.id })

	if (getOrganizationMembershipByUserIdActionRes.success === false) {
		return (
			<div>
				<h1>Algo deu errado</h1>
			</div>
		)
	}

	const membership = getOrganizationMembershipByUserIdActionRes.data.organizationMemberships
	const organizationId = membership.organization_id

	// 3) Pegar tasks da organization
	const getTasksForTableActionRes = await getTasksForTableAction({ organizationId })
	if (getTasksForTableActionRes.success === false) {
		return (
			<div>
				<h1>Algo deu errado</h1>
			</div>
		)
	}

	const tasks = getTasksForTableActionRes.data.tasks

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Minha constelação</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todos os membors da sua constelação.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Tarefas da constelação</h2>
				{/* Futura data-table: */}
				<OrganizationTasksTable data={tasks} />
			</section>
		</div>
	)
}

export default AllTasksPage
