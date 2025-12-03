// src/components/data-tables/organization-invites/organization-invites-table.tsx
"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type ColumnDef, type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import type { OrganizationInviteWithRequestedUser } from "@/types/organization-invite"
import { organizationInvitesColumns } from "./columns"
import { OrganizationInvitesTableToolbar } from "./organization-invites-table-toolbar"

const ORGANIZATION_INVITES_TABLE_STORAGE_KEY = "organization-invites-table-state"

// Filtro fuzzy global baseado em nome + e-mail do convidado
const fuzzyFilter: FilterFn<OrganizationInviteWithRequestedUser> = (row, _columnId, value, addMeta) => {
	const name = row.original.requested_user?.name ?? ""
	const email = row.original.requested_user?.email ?? ""
	const haystack = `${name} ${email}`.trim()

	const itemRank = rankItem(haystack, String(value))

	addMeta?.({ itemRank })

	return itemRank.passed
}

interface OrganizationInvitesTableProps {
	data: OrganizationInviteWithRequestedUser[]
}

export const OrganizationInvitesTable = ({ data }: OrganizationInvitesTableProps) => {
	const [rowSelection, setRowSelection] = useState({})
	const [globalFilter, setGlobalFilter] = useState("")

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedTableState({
		storageKey: ORGANIZATION_INVITES_TABLE_STORAGE_KEY,
		initialState: {
			columnVisibility: {
				// exemplo: você pode esconder alguma coluna aqui se quiser
				// expires_at: false,
			},
			sorting: [{ id: "created_at", desc: true }]
		}
	})

	const table = useReactTable({
		data: data ?? [],
		columns: organizationInvitesColumns as ColumnDef<OrganizationInviteWithRequestedUser>[],
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
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		globalFilterFn: fuzzyFilter,
		enableRowSelection: false // por enquanto só exibição
	})

	const columnNameMap: { [key: string]: string } = {
		requested_user: "Usuário convidado",
		role: "Permissão",
		status: "Status",
		origin: "Origem",
		created_at: "Criado em",
		expires_at: "Expira em"
	}

	const toolbar = (
		<div className="flex items-center justify-between gap-2 flex-wrap">
			<OrganizationInvitesTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	return <DataTable table={table} toolbar={toolbar} />
}
