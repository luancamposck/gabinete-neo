// src/components/data-tables/organization-invites/organization-invites-table-toolbar.tsx
"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { Input } from "@/components/ui/input"

const roles = [
	{ value: "OWNER", label: "Owner" },
	{ value: "ADMIN", label: "Admin" },
	{ value: "MEMBER", label: "Membro" }
]

const statuses = [
	{ value: "PENDING", label: "Pendente" },
	{ value: "APPROVED", label: "Aprovado" },
	{ value: "REJECTED", label: "Rejeitado" },
	{ value: "EXPIRED", label: "Expirado" },
	{ value: "CANCELED", label: "Cancelado" }
]

const origins = [
	{ value: "PUBLIC_LINK", label: "Link público" },
	{ value: "EMAIL_INVITE", label: "Convite por e-mail" },
	{ value: "INTERNAL", label: "Interno" }
]

interface OrganizationInvitesTableToolbarProps<TData> {
	table: Table<TData>
}

export const OrganizationInvitesTableToolbar = <TData,>({ table }: OrganizationInvitesTableToolbarProps<TData>) => {
	const isFiltered = table.getState().columnFilters.length > 0
	const globalFilter = (table.getState().globalFilter as string) ?? ""

	return (
		<div className="flex items-center justify-between gap-2 flex-wrap">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input placeholder="Buscar por ID ou usuário convidado..." value={globalFilter} onChange={(event) => table.setGlobalFilter(event.target.value)} className="h-8 w-[180px] lg:w-[260px]" />

				{table.getColumn("status") && <DataTableFacetedFilter column={table.getColumn("status")} title="Status" options={statuses} />}

				{table.getColumn("role") && <DataTableFacetedFilter column={table.getColumn("role")} title="Permissão" options={roles} />}

				{table.getColumn("origin") && <DataTableFacetedFilter column={table.getColumn("origin")} title="Origem" options={origins} />}

				{isFiltered && (
					<Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
						Limpar filtros
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
