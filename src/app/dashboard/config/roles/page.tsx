import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getOrganizationRolesContextAction } from "@/modules/organizations/memberships/server/slices/get-organization-roles-context/actions/get-organization-roles-context.action"
import { RolesCards } from "@/modules/organizations/memberships/shared/ui/roles/roles-cards"
import { Button } from "@/shared/components/ui/button"

const RolesConfigPage = async () => {
	const rolesContextRes = await getOrganizationRolesContextAction()

	if (rolesContextRes.success === false) {
		switch (rolesContextRes.code) {
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
				throw new Error(rolesContextRes.message)
			}
		}
	}

	const { organization, roles, permissionsKeys, availablePermissions, isCurrentUserOwner } = rolesContextRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="flex justify-between gap-y-1">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Cargos e permissões</h1>
					<p className="text-sm text-muted-foreground">Gerencie a visualização das permissões de cada cargo da organização {organization.name}.</p>
				</div>

				<Button asChild>
					<Link href="/dashboard/config/roles/new">
						<PlusCircle />
						Criar novo cargo
					</Link>
				</Button>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">{roles.length} cargos ativos na organização</h2>
				<p className="text-xs text-muted-foreground">Seu usuário possui {permissionsKeys.length} permissões no contexto atual.</p>
				<RolesCards roles={roles} permissionsKeys={permissionsKeys} availablePermissions={availablePermissions} isCurrentUserOwner={isCurrentUserOwner} />
			</section>
		</div>
	)
}

export default RolesConfigPage
