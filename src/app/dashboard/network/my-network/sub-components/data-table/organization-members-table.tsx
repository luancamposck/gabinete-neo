"use client"

import { type ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react"

import { DataTable } from "@/components/ui/data-table"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import type { OrganizationMemberDTO } from "@/types/dto/organization-member.dto"

import { organizationMembersColumns } from "./columns"

const ORGANIZATION_MEMBERS_TABLE_STORAGE_KEY = "organization-members-table-state"

interface OrganizationMembersTableProps {
	data: OrganizationMemberDTO[]
}

export const OrganizationMembersTable = ({ data }: OrganizationMembersTableProps) => {
	const [rowSelection, setRowSelection] = useState({})

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedTableState({
		storageKey: ORGANIZATION_MEMBERS_TABLE_STORAGE_KEY,
		initialState: {
			columnVisibility: {},
			sorting: [{ id: "createdAt", desc: false }]
		}
	})

	const table = useReactTable({
		data: data ?? [],
		columns: organizationMembersColumns as ColumnDef<OrganizationMemberDTO>[],
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters
		},
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel()
	})

	// por enquanto sem toolbar (sem filtros / busca / view options)
	const toolbar = null

	return <DataTable table={table} toolbar={toolbar} />
}
