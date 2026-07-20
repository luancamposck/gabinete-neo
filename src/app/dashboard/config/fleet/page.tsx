import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getPendingDriverApplicationsAction } from "@/modules/fleet/server/actions/get-pending-driver-applications.action"
import { ApplicationsExplorer } from "@/modules/fleet/shared/ui/applications/applications-explorer"
import { Button } from "@/shared/components/ui/button"

const FleetConfigPage = async () => {
	const applicationsRes = await getPendingDriverApplicationsAction()

	if (applicationsRes.success === false) {
		switch (applicationsRes.code) {
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
				throw new Error(applicationsRes.message)
			}
		}
	}

	const { applications } = applicationsRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Candidaturas de frota</h1>
					<p className="text-sm text-muted-foreground">Revise as candidaturas de motorista pendentes e seus documentos.</p>
				</div>

				<Button asChild>
					<Link href="/dashboard/config/fleet/new">
						<PlusCircle />
						Adicionar candidatura
					</Link>
				</Button>
			</header>

			<ApplicationsExplorer applications={applications} />
		</div>
	)
}

export default FleetConfigPage
