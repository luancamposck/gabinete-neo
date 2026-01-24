// @/app/dashboard/network/map/page.tsx

import MapClient from "@/modules/organizations/insights/people-map/ui/map-client"

export default function NetworkMapPage() {
	return (
		<div className="flex flex-col gap-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Mapa da rede</h1>
				<p className="text-sm text-muted-foreground">Visualize a distribuição geográfica dos membros da constelação.</p>
			</div>
			<MapClient />
		</div>
	)
}
