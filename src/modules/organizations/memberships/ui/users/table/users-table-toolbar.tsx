"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Input } from "@/components/ui/input"

type UsersTableToolbarProps<TData> = {
	table: Table<TData>
}

const statusOptions = [
	{ value: "true", label: "Ativo" },
	{ value: "false", label: "Inativo" }
]

const roleLabelMap: Record<string, string> = {
	OWNER: "Owner",
	ADMIN: "Admin",
	STAFF: "Equipe",
	MEMBER: "Membro"
}

export const UsersTableToolbar = <TData,>({ table }: UsersTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0
	const globalFilter = (table.getState().globalFilter as string) ?? ""
	const stateColumn = table.getColumn("state")
	const roleColumn = table.getColumn("role")

	const stateOptions = useMemo(() => {
		if (!stateColumn?.getFacetedUniqueValues) return []
		const faceted = stateColumn.getFacetedUniqueValues()
		return Array.from(faceted.keys())
			.filter(Boolean)
			.map((value) => String(value))
			.sort((a, b) => a.localeCompare(b))
			.map((value) => ({ value, label: value }))
	}, [stateColumn])

	const roleOptions = useMemo(() => {
		if (!roleColumn?.getFacetedUniqueValues) return []
		const faceted = roleColumn.getFacetedUniqueValues()
		return Array.from(faceted.keys())
			.filter(Boolean)
			.map((value) => String(value))
			.map((value) => {
				const roleKey = value.toUpperCase()
				return { value, label: roleLabelMap[roleKey] ?? value }
			})
			.sort((a, b) => a.label.localeCompare(b.label))
	}, [roleColumn])

	const handleClearFilters = () => {
		table.resetColumnFilters()
		table.setGlobalFilter("")
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Input placeholder="Buscar por nome, email ou telefone..." value={globalFilter} onChange={(event) => table.setGlobalFilter(event.target.value)} className="h-8 w-full md:w-[220px] lg:w-[280px]" />

			{roleOptions.length > 0 && roleColumn && <DataTableFacetedFilter column={roleColumn} title="Cargo" options={roleOptions} />}
			{stateOptions.length > 0 && stateColumn && <DataTableFacetedFilter column={stateColumn} title="Estado" options={stateOptions} />}
			{table.getColumn("isActive") && <DataTableFacetedFilter column={table.getColumn("isActive")} title="Status" options={statusOptions} />}

			{isFiltered && (
				<Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
					Limpar filtros
					<X className="ml-2 h-4 w-4" />
				</Button>
			)}
		</div>
	)
}
