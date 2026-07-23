import { notFound, redirect } from "next/navigation"

import { getFleetDriversForTableAction } from "@/modules/fleet/server/actions/get-fleet-drivers-for-table.action"
import { DriversExplorer } from "@/modules/fleet/shared/ui/drivers/drivers-explorer"

const FleetDriversPage = async () => {
	const driversRes = await getFleetDriversForTableAction()

	if (driversRes.success === false) {
		switch (driversRes.code) {
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
				throw new Error(driversRes.message)
			}
		}
	}

	const { drivers } = driversRes.data

	return (
		<div className="p-4 space-y-6">
			<header className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Motoristas da frota</h1>
				<p className="text-sm text-muted-foreground">Consulte os motoristas aprovados, seus veículos e status atual.</p>
			</header>

			<DriversExplorer drivers={drivers} />
		</div>
	)
}

export default FleetDriversPage
