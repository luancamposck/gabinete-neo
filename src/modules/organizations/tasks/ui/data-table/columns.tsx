"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ClipboardList, Clock, User as UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OrganizationTaskTableRow } from "@/modules/organizations/tasks/shared/types/organization-tasks-table.types"

import { OrganizationTaskActions } from "./organization-task-actions"

export const getTaskCreatorLabel = (task: OrganizationTaskTableRow) => task.createdByName ?? task.createdByEmail ?? "Usuário desconhecido"

function formatDateTime(value: string | null | undefined) {
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

const statusLabelMap: Record<string, string> = {
	NOT_STARTED: "Não iniciado",
	IN_PROGRESS: "Em andamento",
	CANCELED: "Cancelado",
	COMPLETED: "Concluído"
}

const statusColorMap: Record<string, string> = {
	NOT_STARTED: "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-100",
	IN_PROGRESS: "border-blue-300 text-blue-700 dark:border-blue-400 dark:text-blue-200",
	CANCELED: "border-red-300 text-red-700 dark:border-red-400 dark:text-red-200",
	COMPLETED: "border-emerald-300 text-emerald-700 dark:border-emerald-400 dark:text-emerald-200"
}

export const organizationTasksColumns: ColumnDef<OrganizationTaskTableRow>[] = [
	{
		accessorKey: "title",
		header: "Título",
		cell: ({ row }) => {
			const { title } = row.original

			return (
				<div className="flex items-center gap-2">
					<ClipboardList className="h-4 w-4 text-primary/80" />
					<span className="text-sm font-medium">{title}</span>
				</div>
			)
		}
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.original.status
			const label = statusLabelMap[status] ?? status
			const colorClasses = statusColorMap[status] ?? "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-100"

			return (
				<div className="flex items-center gap-2">
					<span className={cn("h-2.5 w-2.5 rounded-full", status === "COMPLETED" ? "bg-emerald-500" : status === "IN_PROGRESS" ? "bg-blue-500" : status === "CANCELLED" ? "bg-red-500" : "bg-zinc-400 dark:bg-zinc-600")} />
					<Badge variant="outline" className={cn("text-xs font-medium", colorClasses)}>
						{label}
					</Badge>
				</div>
			)
		},
		filterFn: (row, id, value) => (value as string[]).includes(String(row.getValue(id)))
	},
	{
		accessorKey: "dueAt",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
				Prazo
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const dueAt = row.original.dueAt

			return (
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Clock className="h-3.5 w-3.5" />
					<span>{formatDateTime(dueAt)}</span>
				</div>
			)
		}
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0">
				Criada em
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row }) => {
			const createdAt = row.original.createdAt
			return <span className="text-xs text-muted-foreground">{formatDateTime(createdAt)}</span>
		}
	},
	{
		accessorKey: "createdByName",
		header: "Criada por",
		cell: ({ row }) => {
			const creatorLabel = getTaskCreatorLabel(row.original)
			const email = row.original.createdByEmail
			const shouldShowEmail = email && email !== creatorLabel

			return (
				<div className="flex items-center gap-2">
					<UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
					<div className="flex flex-col">
						<span className="text-sm font-medium">{creatorLabel}</span>
						{shouldShowEmail && <span className="text-xs text-muted-foreground">{email}</span>}
					</div>
				</div>
			)
		},
		filterFn: (row, _id, value) => (value as string[]).includes(getTaskCreatorLabel(row.original))
	},
	{
		id: "actions",
		header: "",
		cell: ({ row }) => <OrganizationTaskActions task={row.original} />,
		enableSorting: false,
		enableHiding: false
	}
]
