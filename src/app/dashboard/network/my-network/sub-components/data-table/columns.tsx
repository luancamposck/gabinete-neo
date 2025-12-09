"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatPhone } from "@/lib/utils/formatters"
import type { OrganizationMemberDTO } from "@/types/dto/organization-member.dto"

import { OrganizationMemberAddressPopover } from "../organization-member-address-popover.sub-component"
import { OrganizationMemberActions } from "./organization-member-actions"

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

export const organizationMembersColumns: ColumnDef<OrganizationMemberDTO>[] = [
	{
		accessorKey: "userName",
		header: "Nome",
		accessorFn: (row) => row.user.name ?? row.user.email,
		cell: ({ row }) => {
			const member = row.original
			const name = member.user.name ?? "Sem nome cadastrado"

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
		accessorFn: (row) => row.user.phone ?? "",
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
			const city = address?.city
			const state = address?.state

			const locationLabel = city || state ? `${city ?? ""}${city && state ? " / " : ""}${state ?? ""}` : "-"

			return (
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground truncate max-w-[140px]">{locationLabel}</span>

					<OrganizationMemberAddressPopover address={address} />
				</div>
			)
		}
	},
	{
		accessorKey: "state",
		header: "Estado",
		accessorFn: (row) => row.user.address?.state ?? "",
		cell: ({ row }) => {
			const state = row.original.user.address?.state
			return <span className="text-sm text-muted-foreground">{state || "-"}</span>
		},
		enableHiding: true,
		enableSorting: false,
		filterFn: (row, id, value) => (value as string[]).includes((row.getValue(id) as string) ?? "")
	},
	{
		accessorKey: "role",
		header: "Permissão",
		cell: ({ row }) => {
			const role = row.original.role

			const label = role === "OWNER" ? "Owner" : role === "ADMIN" ? "Admin" : "Membro"

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
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
				Entrou em
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const createdAt = row.original.createdAt
			return <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
		}
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => <OrganizationMemberActions member={row.original} />,
		enableSorting: false,
		enableHiding: false
	}
]
