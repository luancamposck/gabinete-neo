"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/shared/components/ui/button"
import { DataTableFacetedFilter } from "@/shared/components/ui/data-table-faceted-filter"
import { Input } from "@/shared/components/ui/input"

type MembersTableToolbarProps<TData> = {
	table: Table<TData>
}

const statusOptions = [
	{ value: "true", label: "Ativo" },
	{ value: "false", label: "Inativo" }
]

export const MembersTableToolbar = <TData,>({ table }: MembersTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0
	const globalFilter = (table.getState().globalFilter as string) ?? ""
	const stateColumn = table.getColumn("state")

	const stateOptions = useMemo(() => {
		if (!stateColumn?.getFacetedUniqueValues) return []
		const faceted = stateColumn.getFacetedUniqueValues()
		return Array.from(faceted.keys())
			.filter(Boolean)
			.map((value) => String(value))
			.sort((a, b) => a.localeCompare(b))
			.map((value) => ({ value, label: value }))
	}, [stateColumn])

	const handleClearFilters = () => {
		table.resetColumnFilters()
		table.setGlobalFilter("")
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input placeholder="Buscar por nome, email ou telefone..." value={globalFilter} onChange={(event) => table.setGlobalFilter(event.target.value)} className="h-8 w-full md:w-[220px] lg:w-[280px]" />

				<div className="grid grid-cols-1 gap-3 xs:grid-cols-2 mx-auto sm:mx-0 sm:grid-cols-3 md:contents">
					{stateOptions.length > 0 && stateColumn && <DataTableFacetedFilter column={stateColumn} title="Estado" options={stateOptions} />}
					{table.getColumn("isActive") && <DataTableFacetedFilter column={table.getColumn("isActive")} title="Status" options={statusOptions} />}

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
