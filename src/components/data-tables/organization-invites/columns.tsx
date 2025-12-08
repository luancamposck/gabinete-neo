// src/components/data-tables/organization-invites/columns.tsx
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { OrganizationInviteWithRequestedUser } from "@/types/organization-invite"
import { OrganizationTableActions } from "./organization-table-actions"

function formatDate(value: string | null | undefined) {
	if (!value) return "—"
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "—"

	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(date)
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	PENDING: "secondary",
	APPROVED: "default",
	REJECTED: "destructive",
	EXPIRED: "outline",
	CANCELED: "outline"
}

export const organizationInvitesColumns: ColumnDef<OrganizationInviteWithRequestedUser>[] = [
	{
		accessorKey: "requested_user", // campo virtual (vem do join)
		header: "Usuário convidado",
		cell: ({ row }) => {
			const requestedUser = row.original.requested_user

			if (!requestedUser) {
				return <span className="text-xs text-muted-foreground">Usuário não encontrado</span>
			}

			const displayName = requestedUser.name || requestedUser.email

			return (
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex flex-col text-left cursor-default max-w-[220px]">
							<span className="text-sm font-medium truncate">{displayName}</span>
							<span className="text-xs text-muted-foreground truncate">{requestedUser.email}</span>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>{requestedUser.name ?? "Sem nome cadastrado"}</p>
						<p className="text-muted-foreground">{requestedUser.email}</p>
					</TooltipContent>
				</Tooltip>
			)
		}
	},
	{
		accessorKey: "role",
		header: "Permissão",
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
		cell: ({ row }) => {
			const role = row.getValue("role") as string

			const label = role === "OWNER" ? "Owner" : role === "ADMIN" ? "Admin" : "Membro"

			return (
				<Badge variant="outline" className="font-medium">
					{label}
				</Badge>
			)
		}
	},
	{
		accessorKey: "status",
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
					Status
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			)
		},
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
		cell: ({ row }) => {
			const status = row.getValue("status") as string
			const labelMap: Record<string, string> = {
				PENDING: "Pendente",
				APPROVED: "Aprovado",
				REJECTED: "Rejeitado",
				EXPIRED: "Expirado",
				CANCELED: "Cancelado"
			}

			return (
				<Badge variant={statusVariantMap[status] ?? "secondary"} className={cn("text-xs font-semibold", status === "APPROVED" && "bg-green-500 text-white")}>
					{labelMap[status] ?? status}
				</Badge>
			)
		}
	},
	{
		accessorKey: "origin",
		header: "Origem",
		filterFn: (row, id, value) => {
			return value.includes(row.getValue(id))
		},
		cell: ({ row }) => {
			const origin = row.getValue("origin") as string
			const labelMap: Record<string, string> = {
				PUBLIC_LINK: "Link público",
				EMAIL_INVITE: "Convite por e-mail",
				INTERNAL: "Interno"
			}

			return <span className="text-xs text-muted-foreground">{labelMap[origin] ?? origin}</span>
		}
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
				Criado em
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const createdAt = row.getValue("created_at") as string
			return <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
		}
	},
	{
		id: "actions",
		header: "Ações",
		cell: ({ row }) => {
			const invite = row.original
			return <OrganizationTableActions invite={invite} />
		},
		enableSorting: false,
		enableHiding: false
	}
]
