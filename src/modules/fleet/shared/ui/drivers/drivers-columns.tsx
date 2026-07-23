// @/modules/fleet/shared/ui/drivers/drivers-columns.tsx
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import type { FleetDriverForTableDTO } from "@/modules/fleet/shared/types/flows/get-fleet-drivers-for-table.types"
import { formatApplicationDate, VehicleTypeBadge } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { DriverStatusBadge } from "@/modules/fleet/shared/ui/drivers/driver-status-badge"
import { Button } from "@/shared/components/ui/button"

export const driversColumns: ColumnDef<FleetDriverForTableDTO>[] = [
	{
		id: "member",
		accessorFn: (row) => row.member.name,
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 has-[>svg]:px-0">
				Membro
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => (
			<div className="flex flex-col">
				<span className="text-sm font-medium">{row.original.member.name}</span>
				<span className="text-xs text-muted-foreground">{row.original.member.email}</span>
			</div>
		),
		enableHiding: false
	},
	{
		accessorKey: "plate",
		header: "Placa",
		cell: ({ row }) => <span className="font-mono text-sm font-medium tracking-wide uppercase">{row.original.plate}</span>
	},
	{
		accessorKey: "vehicleType",
		header: "Tipo",
		// -ml-2 cancela o px-2 interno do Badge para alinhar o conteúdo visível
		// com o texto do header (que não tem esse padding extra).
		cell: ({ row }) => <VehicleTypeBadge type={row.original.vehicleType} className="-ml-2" />,
		filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id)))
	},
	{
		accessorKey: "approvedAt",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 has-[>svg]:px-0">
				Aprovado em
				<ArrowUpDown className="ml-2 size-4" />
			</Button>
		),
		cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatApplicationDate(row.original.approvedAt)}</span>
	},
	{
		id: "status",
		accessorFn: (row) => (row.isActive ? "active" : "inactive"),
		header: "Status",
		cell: ({ row }) => <DriverStatusBadge isActive={row.original.isActive} className="-ml-2" />,
		filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id)))
	}
]
