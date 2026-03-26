"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { OrganizationMemberTableRow } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import { MemberActionsCell } from "@/modules/organizations/memberships/shared/ui/data-table/actions/member-actions-cell"
import { MemberAddressPopover } from "@/modules/organizations/memberships/shared/ui/data-table/shared/member-address-popover"
import type { MembersTableMeta } from "@/modules/organizations/memberships/shared/ui/data-table/table-meta.types"
import { formatPhone } from "@/shared/formatters/format-phone"

function formatDate(value: string | null | undefined) {
	if (!value) return "-"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "-"

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(date)
}

const roleLabelMap: Record<string, string> = {
	OWNER: "Owner",
	ADMIN: "Admin",
	MEMBER: "Membro"
}

export const membersColumns: ColumnDef<OrganizationMemberTableRow>[] = [
	{
		accessorKey: "userName",
		header: "Nome",
		accessorFn: (row) => row.user.name || row.user.email,
		cell: ({ row }) => {
			const member = row.original
			const name = member.user.name || "Sem nome cadastrado"

			return (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{name}</span>
				</div>
			)
		}
	},
	{
		accessorKey: "phone",
		header: "Telefone",
		accessorFn: (row) => row.user.phone,
		cell: ({ row }) => {
			const phone = row.original.user.phone

			return <span className="text-sm text-muted-foreground">{phone ? formatPhone(phone) : "-"}</span>
		}
	},
	{
		accessorKey: "email",
		header: "E-mail",
		accessorFn: (row) => row.user.email,
		cell: ({ row }) => {
			const email = row.original.user.email

			return <span className="text-sm text-muted-foreground">{email}</span>
		}
	},
	{
		id: "location",
		header: "Localização",
		cell: ({ row }) => {
			const address = row.original.user.address
			const city = address.city
			const state = address.state

			const locationLabel = city || state ? `${city ?? ""}${city && state ? " / " : ""}${state ?? ""}` : "-"

			return (
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground truncate max-w-[140px]">{locationLabel}</span>
					<MemberAddressPopover address={address} />
				</div>
			)
		}
	},
	{
		accessorKey: "state",
		header: "Estado",
		accessorFn: (row) => row.user.address.state,
		cell: ({ row }) => {
			const state = row.original.user.address.state
			return <span className="text-sm text-muted-foreground">{state || "-"}</span>
		},
		enableHiding: true,
		enableSorting: false,
		filterFn: (row, id, value) => (value as string[]).includes((row.getValue(id) as string) ?? "")
	},
	{
		id: "role",
		header: "Permissão",
		accessorFn: (row) => row.role.name,
		cell: ({ row }) => {
			const roleName = row.original.role.name
			const roleKey = roleName.toUpperCase()
			const label = roleLabelMap[roleKey] ?? roleName

			return (
				<Badge variant="outline" className="text-xs font-medium">
					{label}
				</Badge>
			)
		}
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: ({ row }) => {
			const isActive = row.original.isActive

			return (
				<div className="flex items-center gap-2">
					<span className={cn("size-2 rounded-full", isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600")} />
					<span className="text-xs text-muted-foreground">{isActive ? "Ativo" : "Inativo"}</span>
				</div>
			)
		},
		filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id)))
	},
	{
		accessorKey: "joinedAt",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
				Entrou em
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const joinedAt = row.original.joinedAt
			return <span className="text-xs text-muted-foreground">{formatDate(joinedAt)}</span>
		}
	},
	{
		id: "actions",
		header: "",
		cell: ({ row, table }) => {
			const meta = table.options.meta as MembersTableMeta | undefined
			const permissionsKeys = meta?.permissionsKeys ?? []
			const availableRoles = meta?.availableRoles ?? []

			return <MemberActionsCell member={row.original} permissionsKeys={permissionsKeys} availableRoles={availableRoles} />
		},
		enableSorting: false,
		enableHiding: false
	}
]
