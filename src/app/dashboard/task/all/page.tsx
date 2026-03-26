import { redirect } from "next/navigation"

import { getTasksForTableAction } from "@/modules/organizations/tasks/server/slices/get-tasks-for-table/actions/get-tasks-for-table.action"
import { OrganizationTasksTable } from "@/modules/organizations/tasks/shared/ui/data-table/organization-tasks-table"

const AllTasksPage = async () => {
	const tasksRes = await getTasksForTableAction()

	if (tasksRes.success === false) {
		switch (tasksRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			case "not_member": {
				return redirect("/no-organization")
			}

			default: {
				throw new Error(tasksRes.message)
			}
		}
	}

	const { tasks } = tasksRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Minha constelação</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todos os membors da sua constelação.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Tarefas da constelação</h2>
				<OrganizationTasksTable data={tasks} />
			</section>
		</div>
	)
}

export default AllTasksPage
