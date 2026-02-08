import { getOrganizationMembersForTableAction } from "@/modules/organizations/memberships/server/slices/get-organization-members-for-table/actions/get-organization-members-for-table.action"
import { OrganizationMembersTable } from "@/modules/organizations/memberships/ui/data-table/organization-members-table"

const MyNetworkPage = async () => {
	const membersRes = await getOrganizationMembersForTableAction()

	if (!membersRes.success || !membersRes.data) {
		return (
			<div className="p-4 space-y-6">
				<header className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Minha constelação</h1>
					<p className="text-sm text-muted-foreground">Confira aqui todos os membros da sua constelação.</p>
				</header>
				<section className="space-y-2">
					<h2 className="text-sm font-medium text-muted-foreground">Membros da constelação</h2>
					<p className="text-sm text-destructive">{membersRes.message ?? "Erro ao carregar membros."}</p>
				</section>
			</div>
		)
	}

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Minha constelação</h1>
				<p className="text-sm text-muted-foreground">Confira aqui todos os membros da sua constelação.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">Membros da constelação</h2>
				<OrganizationMembersTable data={membersRes.data.members} />
			</section>
		</div>
	)
}

export default MyNetworkPage
