import { redirect } from "next/navigation"

import { getCurrentAuthUserAction } from "@/actions/auth/get-current-auth-user.action"
import { getOrganizationMembershipByUserIdAction } from "@/actions/organization-membership"

import { getOrganizationMembersForTable } from "./sub-actions/get-organization-members-for-table.action"
import { OrganizationMembersTable } from "./sub-components/data-table/organization-members-table"

const MyNetworkPage = async () => {
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

	// 3) Pegar membors da organization
	const getOrganizationMembersForTableRes = await getOrganizationMembersForTable({ organizationId: organizationId })
	if (getOrganizationMembersForTableRes.success === false) {
		return (
			<div>
				<h1>Algo deu errado</h1>
			</div>
		)
	}

	const members = getOrganizationMembersForTableRes.data.members

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Minha constelação</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todos os membors da sua constelação.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Membros da constelação</h2>
				<OrganizationMembersTable data={members} />
			</section>
		</div>
	)
}

export default MyNetworkPage
