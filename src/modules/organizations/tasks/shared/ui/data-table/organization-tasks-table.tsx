"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type ColumnDef, type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"
import type { OrganizationTaskTableRow } from "@/modules/organizations/tasks/shared/types/organization-tasks-table.types"
import { DataTable } from "@/shared/components/ui/data-table"
import { DataTableViewOptions } from "@/shared/components/ui/data-table-view-options"
import { usePersistedTableState } from "@/shared/hooks/use-persisted-table-state"

import { organizationTasksColumns } from "./columns"
import { OrganizationTasksTableToolbar } from "./organization-tasks-table-toolbar"

const ORGANIZATION_TASKS_TABLE_STORAGE_KEY = "organization-tasks-table-state"

const fuzzyFilter: FilterFn<OrganizationTaskTableRow> = (row, _columnId, value, addMeta) => {
	const { title, description, createdByName, createdByEmail } = row.original

	const haystack = `${title ?? ""} ${description ?? ""} ${createdByName ?? ""} ${createdByEmail ?? ""}`.trim()

	const itemRank = rankItem(haystack, String(value))

	addMeta?.({ itemRank })

	return itemRank.passed
}

interface OrganizationTasksTableProps {
	data: OrganizationTaskTableRow[]
}

export const OrganizationTasksTable = ({ data }: OrganizationTasksTableProps) => {
	const [rowSelection, setRowSelection] = useState({})
	const [globalFilter, setGlobalFilter] = useState("")

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedTableState({
		storageKey: ORGANIZATION_TASKS_TABLE_STORAGE_KEY,
		initialState: {
			columnVisibility: {
				createdByEmail: false
			},
			sorting: [{ id: "createdAt", desc: true }]
		}
	})

	const table = useReactTable({
		data: data ?? [],
		columns: organizationTasksColumns as ColumnDef<OrganizationTaskTableRow>[],
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
		title: "Título",
		status: "Status",
		dueAt: "Prazo",
		createdAt: "Criada em",
		createdByName: "Criada por",
		createdByEmail: "E-mail do criador"
	}

	const toolbar = (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<OrganizationTasksTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	return <DataTable table={table} toolbar={toolbar} />
}
