"use client"

import { rankItem } from "@tanstack/match-sorter-utils"
import { type FilterFn, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import type { OrganizationUserTableRow } from "@/modules/organizations/memberships/shared/types/organization-users-table.types"
import { UsersCards } from "@/modules/organizations/memberships/shared/ui/users/cards/users-cards"
import { usePersistedUsersTableState } from "@/modules/organizations/memberships/shared/ui/users/table/use-persisted-users-table-state"
import { usersColumns } from "@/modules/organizations/memberships/shared/ui/users/table/users-columns"
import { UsersTable } from "@/modules/organizations/memberships/shared/ui/users/table/users-table"
import type { UsersTableMeta } from "@/modules/organizations/memberships/shared/ui/users/table/users-table-meta.types"
import { UsersTableToolbar } from "@/modules/organizations/memberships/shared/ui/users/table/users-table-toolbar"

type UsersExplorerProps = {
	users: OrganizationUserTableRow[]
	permissionKeys: PermissionKey[]
	roles: OrganizationRoleOption[]
}

type ViewMode = "table" | "cards"

const TABLE_STORAGE_KEY = "organization-users-table-state"
const VIEW_MODE_STORAGE_KEY = "organization-users-view-mode"

const fuzzyFilter: FilterFn<OrganizationUserTableRow> = (row, _columnId, value, addMeta) => {
	const name = row.original.user.name
	const email = row.original.user.email
	const phone = row.original.user.phone
	const invitedByUserName = row.original.invitedByUserName ?? ""
	const relationshipToInviter = row.original.relationshipToInviter ?? ""
	const haystack = `${name} ${email} ${phone} ${invitedByUserName} ${relationshipToInviter}`.trim()

	const itemRank = rankItem(haystack, String(value))
	addMeta?.({ itemRank })
	return itemRank.passed
}

const columnNameMap: { [key: string]: string } = {
	userName: "Nome",
	phone: "Telefone",
	email: "E-mail",
	location: "Localização",
	state: "Estado",
	role: "Cargo",
	invitedByUserName: "Convidado por",
	relationshipToInviter: "Parentesco",
	isActive: "Status",
	joinedAt: "Entrou em"
}

const getInitialViewMode = () => {
	if (typeof window === "undefined") {
		return "table" as ViewMode
	}

	const savedViewMode = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
	return savedViewMode === "cards" ? "cards" : "table"
}

export const UsersExplorer = ({ users, permissionKeys, roles }: UsersExplorerProps) => {
	const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode)
	const [rowSelection, setRowSelection] = useState({})
	const [globalFilter, setGlobalFilter] = useState("")

	const { sorting, setSorting, columnFilters, setColumnFilters, columnVisibility, setColumnVisibility } = usePersistedUsersTableState({
		storageKey: TABLE_STORAGE_KEY,
		initialState: {
			columnVisibility: {
				state: false
			},
			sorting: [{ id: "joinedAt", desc: false }]
		}
	})

	useEffect(() => {
		window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
	}, [viewMode])

	useEffect(() => {
		const hasLegacyCreatedAt = sorting.some((sort) => sort.id === "createdAt")
		if (!hasLegacyCreatedAt) return

		setSorting((prev) => prev.map((sort) => (sort.id === "createdAt" ? { ...sort, id: "joinedAt" } : sort)))
	}, [sorting, setSorting])

	const tableMeta = useMemo<UsersTableMeta>(
		() => ({
			permissionKeys,
			availableRoles: roles
		}),
		[permissionKeys, roles]
	)

	const hasAnyStatusPermission = useMemo(() => permissionKeys.includes("org.membership.status.update") || permissionKeys.includes("org.membership.status.update.privileged"), [permissionKeys])
	const hasAnyRolePermission = useMemo(() => permissionKeys.includes("org.membership.role.update") || permissionKeys.includes("org.membership.role.update.privileged"), [permissionKeys])
	const hasAnyActionsPermission = hasAnyStatusPermission || hasAnyRolePermission
	const columns = useMemo(() => (hasAnyActionsPermission ? usersColumns : usersColumns.filter((column) => column.id !== "actions")), [hasAnyActionsPermission])

	const table = useReactTable({
		data: users ?? [],
		columns,
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

	const paginatedUsers = table.getRowModel().rows.map((row) => row.original)

	return (
		<div className="w-full space-y-4">
			<div className="flex items-start justify-between gap-2 flex-wrap">
				<UsersTableToolbar table={table} />
				<div className="flex items-center gap-2 ml-auto">
					<Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
						<TabsList>
							<TabsTrigger value="table">
								<TableIcon className="size-4" />
								Tabela
							</TabsTrigger>
							<TabsTrigger value="cards">
								<LayoutGrid className="size-4" />
								Cards
							</TabsTrigger>
						</TabsList>
					</Tabs>
					<DataTableViewOptions table={table} columnNameMap={columnNameMap} />
				</div>
			</div>

			{viewMode === "table" ? <UsersTable table={table} /> : <UsersCards users={paginatedUsers} permissionKeys={permissionKeys} availableRoles={roles} />}

			<DataTablePagination table={table} />
		</div>
	)
}
