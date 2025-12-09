"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type ColumnDef, type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"

import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import type { OrganizationMemberDTO } from "@/types/dto/organization-member.dto"

import { organizationMembersColumns } from "./columns"
import { OrganizationMembersTableToolbar } from "./organization-members-table-toolbar"

const ORGANIZATION_MEMBERS_TABLE_STORAGE_KEY = "organization-members-table-state"

const fuzzyFilter: FilterFn<OrganizationMemberDTO> = (row, _columnId, value, addMeta) => {
	const name = row.original.user.name ?? ""
	const email = row.original.user.email ?? ""
	const phone = row.original.user.phone ?? ""
	const haystack = `${name} ${email} ${phone}`.trim()

	const itemRank = rankItem(haystack, String(value))

	addMeta?.({ itemRank })

	return itemRank.passed
}

interface OrganizationMembersTableProps {
	data: OrganizationMemberDTO[]
}

export const OrganizationMembersTable = ({ data }: OrganizationMembersTableProps) => {
	const [rowSelection, setRowSelection] = useState({})
	const [globalFilter, setGlobalFilter] = useState("")

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedTableState({
		storageKey: ORGANIZATION_MEMBERS_TABLE_STORAGE_KEY,
		initialState: {
			columnVisibility: {
				state: false
			},
			sorting: [{ id: "createdAt", desc: false }]
		}
	})

	const table = useReactTable({
		data: data ?? [],
		columns: organizationMembersColumns as ColumnDef<OrganizationMemberDTO>[],
		filterFns: {
			fuzzy: fuzzyFilter
		},
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			globalFilter
		},
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		globalFilterFn: fuzzyFilter
	})

	const columnNameMap: { [key: string]: string } = {
		userName: "Nome",
		phone: "Telefone",
		email: "E-mail",
		location: "Localização",
		state: "Estado",
		role: "Permissão",
		isActive: "Status",
		createdAt: "Entrou em"
	}

	const toolbar = (
		<div className="flex items-center justify-between gap-2 flex-wrap">
			<OrganizationMembersTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	return <DataTable table={table} toolbar={toolbar} />
}
