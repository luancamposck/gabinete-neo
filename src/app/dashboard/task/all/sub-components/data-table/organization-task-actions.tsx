"use client"

import { CalendarDays, Clock, Eye, FileText, Mail, User as UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { OrganizationTaskDTO } from "@/types/dto/organization-task.dto"

const statusLabelMap: Record<string, string> = {
	NOT_STARTED: "Não iniciado",
	IN_PROGRESS: "Em andamento",
	CANCELED: "Cancelado",
	COMPLETED: "Concluído"
}

const statusDotMap: Record<string, string> = {
	NOT_STARTED: "bg-zinc-400 dark:bg-zinc-600",
	IN_PROGRESS: "bg-blue-500",
	CANCELED: "bg-red-500",
	COMPLETED: "bg-emerald-500"
}

function formatDateTime(value: string | null | undefined) {
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

interface OrganizationTaskActionsProps {
	task: OrganizationTaskDTO
}

export const OrganizationTaskActions = ({ task }: OrganizationTaskActionsProps) => {
	const statusLabel = statusLabelMap[task.status] ?? task.status
	const statusDotClass = statusDotMap[task.status] ?? "bg-zinc-400 dark:bg-zinc-600"

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8 p-0" aria-label="Visualizar detalhes da tarefa">
					<Eye className="h-4 w-4" />
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="sm:max-w-xl">
				<SheetHeader className="pb-2">
					<SheetTitle className="flex items-center gap-2">
						<FileText className="h-4 w-4 text-primary" />
						<span>{task.title}</span>
					</SheetTitle>
					<SheetDescription>Tarefa da constelação</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 overflow-y-auto p-4 pt-0">
					{/* Status */}
					<div className="rounded-lg border bg-muted/40 p-3">
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span className={cn("h-2.5 w-2.5 rounded-full", statusDotClass)} />
							<span>Status</span>
						</div>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<Badge variant="outline" className="text-xs font-semibold">
								{statusLabel}
							</Badge>
						</div>
					</div>

					{/* Datas */}
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border bg-card p-3 shadow-sm">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<CalendarDays className="h-3.5 w-3.5" />
								<span>Criada em</span>
							</div>
							<p className="mt-2 text-sm font-medium text-foreground">{formatDateTime(task.createdAt)}</p>
						</div>

						<div className="rounded-lg border bg-card p-3 shadow-sm">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Clock className="h-3.5 w-3.5" />
								<span>Prazo</span>
							</div>
							<p className="mt-2 text-sm font-medium text-foreground">{formatDateTime(task.dueAt)}</p>
						</div>
					</div>

					{/* Criador */}
					<div className="rounded-lg border bg-card p-3 shadow-sm">
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<UserIcon className="h-3.5 w-3.5" />
							<span>Criada por</span>
						</div>

						<div className="mt-2 flex items-start gap-3 text-sm">
							<div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
								{(task.createdByName || task.createdByEmail || "?").charAt(0).toUpperCase()}
							</div>

							<div className="space-y-1">
								<p className="font-medium">{task.createdByName || "Usuário desconhecido"}</p>

								<p className="flex items-center gap-1 text-xs text-muted-foreground">
									<Mail className="h-3 w-3" />
									<span>{task.createdByEmail || "E-mail não informado"}</span>
								</p>
							</div>
						</div>
					</div>

					{/* Descrição */}
					<div className="rounded-lg border bg-card p-3 shadow-sm">
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<FileText className="h-3.5 w-3.5" />
							<span>Descrição</span>
						</div>
						<p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{task.description?.trim() || "Nenhuma descrição foi adicionada a esta tarefa."}</p>
					</div>

					{/* Info técnica (id) */}
					<div className="rounded-lg border bg-muted/30 p-3">
						<p className="text-[11px] font-mono text-muted-foreground">
							<span className="font-semibold">Task ID: </span>
							{task.id}
						</p>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
