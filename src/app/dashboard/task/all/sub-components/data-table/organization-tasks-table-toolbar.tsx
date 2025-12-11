"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Input } from "@/components/ui/input"

interface OrganizationTasksTableToolbarProps<TData> {
	table: Table<TData>
}

const statusOptions = [
	{ value: "NOT_STARTED", label: "Não iniciado" },
	{ value: "IN_PROGRESS", label: "Em andamento" },
	{ value: "CANCELED", label: "Cancelado" },
	{ value: "COMPLETED", label: "Concluído" }
]

export const OrganizationTasksTableToolbar = <TData,>({ table }: OrganizationTasksTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0
	const globalFilter = (table.getState().globalFilter as string) ?? ""

	const handleClearFilters = () => {
		table.resetColumnFilters()
		table.setGlobalFilter("")
	}

	const statusColumn = table.getColumn("status")

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input placeholder="Buscar por título ou criador..." value={globalFilter} onChange={(event) => table.setGlobalFilter(event.target.value)} className="h-8 w-full md:w-[260px] lg:w-[320px]" />

				<div className="flex flex-wrap items-center gap-2">
					{statusColumn && <DataTableFacetedFilter column={statusColumn} title="Status" options={statusOptions} />}

					{isFiltered && (
						<Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
							Limpar filtros
							<X className="ml-2 h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
