"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"

import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import type { OrganizationMemberTableRow, OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import { membersColumns } from "@/modules/organizations/memberships/ui/data-table/columns/members-columns"
import { MembersTableToolbar } from "@/modules/organizations/memberships/ui/data-table/table/members-table-toolbar"
import { usePersistedTableState } from "@/modules/organizations/memberships/ui/data-table/table/use-persisted-table-state"
import type { MembersTableMeta } from "@/modules/organizations/memberships/ui/data-table/table-meta.types"

const TABLE_STORAGE_KEY = "organization-members-table-state"

const fuzzyFilter: FilterFn<OrganizationMemberTableRow> = (row, _columnId, value, addMeta) => {
	const name = row.original.user.name
	const email = row.original.user.email
	const phone = row.original.user.phone
	const haystack = `${name} ${email} ${phone}`.trim()

	const itemRank = rankItem(haystack, String(value))
	addMeta?.({ itemRank })
	return itemRank.passed
}

type MembersTableProps = {
	data: OrganizationMemberTableRow[]
	permissionsKeys: string[]
	roles: OrganizationRoleOption[]
}

export const MembersTable = ({ data, permissionsKeys, roles }: MembersTableProps) => {
	const [rowSelection, setRowSelection] = useState({})
	const [globalFilter, setGlobalFilter] = useState("")

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedTableState({
		storageKey: TABLE_STORAGE_KEY,
		initialState: {
			columnVisibility: {
				state: false
			},
			sorting: [{ id: "joinedAt", desc: false }]
		}
	})

	useEffect(() => {
		const hasLegacyCreatedAt = sorting.some((sort) => sort.id === "createdAt")
		if (!hasLegacyCreatedAt) return

		setSorting((prev) => prev.map((sort) => (sort.id === "createdAt" ? { ...sort, id: "joinedAt" } : sort)))
	}, [sorting, setSorting])

	const tableMeta = useMemo<MembersTableMeta>(
		() => ({
			permissionsKeys,
			availableRoles: roles
		}),
		[permissionsKeys, roles]
	)

	const table = useReactTable({
		data: data ?? [],
		columns: membersColumns,
		meta: tableMeta,
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
		joinedAt: "Entrou em"
	}

	const toolbar = (
		<div className="flex items-center justify-between gap-2 flex-wrap">
			<MembersTableToolbar table={table} />
			<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
		</div>
	)

	return <DataTable table={table} toolbar={toolbar} />
}
