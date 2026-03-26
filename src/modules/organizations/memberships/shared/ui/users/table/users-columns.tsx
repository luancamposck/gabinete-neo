"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { OrganizationUserTableRow } from "@/modules/organizations/memberships/shared/types/organization-users-table.types"
import { MemberAddressPopover } from "@/modules/organizations/memberships/shared/ui/data-table/shared/member-address-popover"
import { UserActionsCell } from "@/modules/organizations/memberships/shared/ui/users/table/user-actions-cell"
import type { UsersTableMeta } from "@/modules/organizations/memberships/shared/ui/users/table/users-table-meta.types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { RELATIONSHIP_OPTIONS } from "@/shared/constants/relationship-options"
import { formatPhone } from "@/shared/formatters/format-phone"

const roleLabelMap: Record<string, string> = {
	OWNER: "Owner",
	ADMIN: "Admin",
	STAFF: "Equipe",
	MEMBER: "Membro"
}

const relationshipLabelMap: Record<string, string> = RELATIONSHIP_OPTIONS.reduce(
	(accumulator, option) => {
		accumulator[option.value] = option.label
		return accumulator
	},
	{} as Record<string, string>
)

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

export const usersColumns: ColumnDef<OrganizationUserTableRow>[] = [
	{
		accessorKey: "userName",
		header: "Nome",
		accessorFn: (row) => row.user.name || row.user.email,
		cell: ({ row }) => {
			const name = row.original.user.name || "Sem nome cadastrado"

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
		header: "Cargo",
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
		},
		filterFn: (row, id, value) => (value as string[]).includes((row.getValue(id) as string) ?? "")
	},
	{
		accessorKey: "invitedByUserName",
		header: "Convidado por",
		cell: ({ row }) => {
			const invitedByUserName = row.original.invitedByUserName
			return <span className="text-sm text-muted-foreground">{invitedByUserName || "-"}</span>
		}
	},
	{
		accessorKey: "relationshipToInviter",
		header: "Parentesco",
		cell: ({ row }) => {
			const relationshipToInviter = row.original.relationshipToInviter
			const relationshipLabel = relationshipToInviter ? (relationshipLabelMap[relationshipToInviter] ?? relationshipToInviter) : "-"

			return <span className="text-sm text-muted-foreground">{relationshipLabel}</span>
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
			const meta = table.options.meta as UsersTableMeta | undefined
			const permissionKeys = meta?.permissionKeys ?? []
			const availableRoles = meta?.availableRoles ?? []

			return <UserActionsCell user={row.original} permissionKeys={permissionKeys} availableRoles={availableRoles} />
		},
		enableSorting: false,
		enableHiding: false
	}
]
