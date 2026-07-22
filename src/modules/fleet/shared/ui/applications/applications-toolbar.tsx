"use client"

import type { Table } from "@tanstack/react-table"
import { Search, X } from "lucide-react"
import { VEHICLE_TYPE_LABELS, VEHICLE_TYPES } from "@/modules/fleet/shared/constants/vehicle-type"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/slices/get-pending-driver-applications.types"
import { VEHICLE_TYPE_ICONS } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { Button } from "@/shared/components/ui/button"
import { DataTableFacetedFilter } from "@/shared/components/ui/data-table-faceted-filter"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/shared/components/ui/input-group"

type ApplicationsToolbarProps = {
	table: Table<PendingDriverApplicationDTO>
}

const vehicleTypeOptions = VEHICLE_TYPES.map((type) => ({
	value: type,
	label: VEHICLE_TYPE_LABELS[type] ?? type,
	icon: VEHICLE_TYPE_ICONS[type]
}))

export const ApplicationsToolbar = ({ table }: ApplicationsToolbarProps) => {
	const globalFilter = (table.getState().globalFilter as string) ?? ""
	const isFiltered = table.getState().columnFilters.length > 0 || globalFilter.length > 0
	const vehicleTypeColumn = table.getColumn("vehicleType")

	const handleClearFilters = () => {
		table.resetColumnFilters()
		table.setGlobalFilter("")
	}

	return (
		<div className="flex flex-1 flex-wrap items-center gap-2">
			<InputGroup className="h-8 w-full sm:w-[240px] lg:w-[280px]">
				<InputGroupAddon>
					<Search className="size-4" />
				</InputGroupAddon>
				<InputGroupInput className="h-8" placeholder="Buscar por nome ou placa..." value={globalFilter} onChange={(event) => table.setGlobalFilter(event.target.value)} aria-label="Buscar candidaturas" />
			</InputGroup>

			{vehicleTypeColumn && <DataTableFacetedFilter column={vehicleTypeColumn} title="Tipo" options={vehicleTypeOptions} />}

			{isFiltered && (
				<Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
					Limpar filtros
					<X className="ml-2 size-4" />
				</Button>
			)}
		</div>
	)
}
