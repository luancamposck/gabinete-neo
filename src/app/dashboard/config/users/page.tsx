import { notFound, redirect } from "next/navigation"

import { getOrganizationUsersContextAction } from "@/modules/organizations/memberships/server/slices/get-organization-users-context/actions/get-organization-users-context.action"
import { UsersExplorer } from "@/modules/organizations/memberships/ui/users/users-explorer"

const UsersConfigPage = async () => {
	const usersContextRes = await getOrganizationUsersContextAction()

	if (usersContextRes.success === false) {
		switch (usersContextRes.code) {
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
				throw new Error(usersContextRes.message)
			}
		}
	}

	const { organization, users, permissionKeys, roles } = usersContextRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Usuários da organização</h1>
				<p className="text-sm text-muted-foreground">Visualize todos os usuários vinculados à organização {organization.name}.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">{users.length} usuários encontrados</h2>
				<UsersExplorer users={users} permissionKeys={permissionKeys} roles={roles} />
			</section>
		</div>
	)
}

export default UsersConfigPage
