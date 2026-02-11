import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getCreateRoleContextAction } from "@/modules/organizations/memberships/server/slices/get-create-role-context/actions/get-create-role-context.action"
import { CreateRoleForm } from "@/modules/organizations/memberships/ui/roles/create-role-form"

const NewRoleConfigPage = async () => {
	const roleContextRes = await getCreateRoleContextAction()

	if (roleContextRes.success === false) {
		switch (roleContextRes.code) {
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
				throw new Error(roleContextRes.message)
			}
		}
	}

	const { organization, availablePermissions } = roleContextRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-3">
				<Button asChild variant="ghost" size="sm" className="w-fit">
					<Link href="/dashboard/config/roles">
						<ArrowLeft className="size-4" />
						Voltar para cargos
					</Link>
				</Button>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Criar novo cargo</h1>
					<p className="text-sm text-muted-foreground">Cadastre um novo cargo e defina as permissões iniciais da organização {organization.name}.</p>
				</div>
			</header>

			<CreateRoleForm availablePermissions={availablePermissions} />
		</div>
	)
}

export default NewRoleConfigPage
