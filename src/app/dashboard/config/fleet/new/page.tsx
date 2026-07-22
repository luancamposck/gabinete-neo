import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getAddDriverApplicationContextAction } from "@/modules/fleet/server/actions/get-add-driver-application-context.action"
import { AddDriverApplicationForm } from "@/modules/fleet/shared/ui/add-driver-application-form"
import { Button } from "@/shared/components/ui/button"

const NewDriverApplicationPage = async () => {
	const contextRes = await getAddDriverApplicationContextAction()

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

	const { candidates } = contextRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-3">
				<Button asChild variant="ghost" size="sm" className="w-fit">
					<Link href="/dashboard/config/fleet">
						<ArrowLeft className="size-4" />
						Voltar para candidaturas
					</Link>
				</Button>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Adicionar candidatura de motorista</h1>
					<p className="text-sm text-muted-foreground">Selecione uma conta já existente na organização e informe os dados de veículo e documentos.</p>
				</div>
			</header>

			<AddDriverApplicationForm candidates={candidates} />
		</div>
	)
}

export default NewDriverApplicationPage
