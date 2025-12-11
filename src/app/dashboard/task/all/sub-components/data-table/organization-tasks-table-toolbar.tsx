"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Input } from "@/components/ui/input"
import type { OrganizationTaskDTO } from "@/types/dto/organization-task.dto"

import { getTaskCreatorLabel } from "./columns"

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
	const preFilteredRows = table.getPreFilteredRowModel().rows

	const handleClearFilters = () => {
		table.resetColumnFilters()
		table.setGlobalFilter("")
	}

	const statusColumn = table.getColumn("status")
	const creatorColumn = table.getColumn("createdByName")

	const creatorOptions = useMemo(() => {
		const creators = new Map<string, { label: string; value: string }>()

		preFilteredRows.forEach((row) => {
			const task = row.original as OrganizationTaskDTO
			const label = getTaskCreatorLabel(task)

			if (!creators.has(label)) {
				creators.set(label, { label, value: label })
			}
		})

		return Array.from(creators.values())
	}, [preFilteredRows])

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input placeholder="Buscar por título ou criador..." value={globalFilter} onChange={(event) => table.setGlobalFilter(event.target.value)} className="h-8 w-full md:w-[260px] lg:w-[320px]" />

				<div className="flex flex-wrap items-center gap-2">
					{statusColumn && <DataTableFacetedFilter column={statusColumn} title="Status" options={statusOptions} />}
					{creatorColumn && creatorOptions.length > 0 && <DataTableFacetedFilter column={creatorColumn} title="Criado por" options={creatorOptions} />}

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
