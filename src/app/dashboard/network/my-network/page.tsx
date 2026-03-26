import { redirect } from "next/navigation"

import { getOrganizationMembersForTableAction } from "@/modules/organizations/memberships/server/slices/get-organization-members-for-table/actions/get-organization-members-for-table.action"
import { MembersTable } from "@/modules/organizations/memberships/shared/ui/data-table/table/members-table"

const MyNetworkPage = async () => {
	const membersRes = await getOrganizationMembersForTableAction()

	if (membersRes.success === false) {
		switch (membersRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			default: {
				throw new Error(membersRes.message)
			}
		}
	}

	const { members, permissionsKeys, roles } = membersRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Minha constelação</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todos os membros da sua constelação.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Membros da constelação</h2>
				<MembersTable data={members} permissionsKeys={permissionsKeys} roles={roles} />
			</section>
		</div>
	)
}

export default MyNetworkPage
