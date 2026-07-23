// @/modules/fleet/shared/ui/drivers/drivers-cards.tsx
"use client"

import type { Row } from "@tanstack/react-table"
import type { FleetDriverForTableDTO } from "@/modules/fleet/shared/types/flows/get-fleet-drivers-for-table.types"
import { formatApplicationDate, VehicleTypeBadge } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { DriverStatusBadge } from "@/modules/fleet/shared/ui/drivers/driver-status-badge"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"

type DriversCardsProps = {
	rows: Row<FleetDriverForTableDTO>[]
}

export const DriversCards = ({ rows }: DriversCardsProps) => {
	if (rows.length === 0) {
		return <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">Nenhum motorista para os filtros atuais.</div>
	}

	return (
		<ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{rows.map((row) => {
				const driver = row.original

				return (
					<li key={row.id}>
						<Card className="h-full gap-4">
							<CardHeader className="gap-2">
								<div className="flex items-start justify-between gap-3">
									<span className="flex min-w-0 flex-col">
										<span className="truncate text-base leading-none font-semibold">{driver.member.name}</span>
										<span className="mt-1 truncate text-sm text-muted-foreground">{driver.member.email}</span>
									</span>
									<DriverStatusBadge isActive={driver.isActive} />
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-mono text-sm font-medium tracking-wide uppercase">{driver.plate}</span>
									<span aria-hidden className="text-muted-foreground/50">
										·
									</span>
									<VehicleTypeBadge type={driver.vehicleType} />
								</div>
							</CardHeader>

							<CardContent>
								<dl className="flex flex-col gap-0.5">
									<dt className="text-xs text-muted-foreground">Aprovado em</dt>
									<dd className="text-sm font-medium">{formatApplicationDate(driver.approvedAt)}</dd>
								</dl>
							</CardContent>
						</Card>
					</li>
				)
			})}
		</ul>
	)
}
