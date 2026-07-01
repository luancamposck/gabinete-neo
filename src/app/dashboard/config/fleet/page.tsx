import { notFound, redirect } from "next/navigation"

import { getPendingDriverApplicationsAction } from "@/modules/fleet/server/slices/review-driver-applications/actions/get-pending-driver-applications.action"
import { DriverApplicationsList } from "@/modules/fleet/shared/ui/driver-applications-list"

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
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Candidaturas de frota</h1>
				<p className="text-sm text-muted-foreground">Revise as candidaturas de motorista pendentes e seus documentos.</p>
			</header>

			<section className="space-y-2">
				<h2 className="text-sm font-medium text-muted-foreground">{applications.length} candidaturas pendentes</h2>
				<DriverApplicationsList applications={applications} />
			</section>
		</div>
	)
}

export default FleetConfigPage
