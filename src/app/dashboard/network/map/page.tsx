// @/app/dashboard/network/map/page.tsx

import { redirect } from "next/navigation"

import { getMapPinsAction } from "@/modules/organizations/insights/people-map/server/slices/get-map-pins/actions/get-map-pins.action"
import MapClient from "@/modules/organizations/insights/people-map/shared/ui/map-client"

export default async function NetworkMapPage() {
	const pinsRes = await getMapPinsAction()

	if (pinsRes.success === false) {
		switch (pinsRes.code) {
			case "unauthenticated": {
				return redirect("/")
			}

			case "org_not_found": {
				return redirect("/tenant-not-found")
			}

			default: {
				throw new Error(pinsRes.message)
			}
		}
	}

	const { pins, totalMembers, mappedMembers, unmappedMembers } = pinsRes.data

	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Mapa da rede</h1>
				<p className="text-sm text-muted-foreground">Visualize a distribuição geográfica dos membros da constelação.</p>
			</div>
			<MapClient pins={pins} totalMembers={totalMembers} mappedMembers={mappedMembers} unmappedMembers={unmappedMembers} />
		</div>
	)
}
