"use client"

import { CalendarClock, Eye, Mail, MapPin, Shield, User as UserIcon } from "lucide-react"
import { useMemo } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { formatCep, formatPhone } from "@/lib/utils/formatters"
import type { OrganizationMemberTableRow } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"

interface OrganizationMemberActionsProps {
	member: OrganizationMemberTableRow
}

const formatDateTime = (value: string | null | undefined) => {
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

const roleLabelMap: Record<string, string> = {
	OWNER: "Owner",
	ADMIN: "Admin",
	MEMBER: "Membro"
}

export const OrganizationMemberActions = ({ member }: OrganizationMemberActionsProps) => {
	const { user, role, isActive, createdAt } = member
	const address = user.address

	const roleKey = role.name.toUpperCase()
	const roleLabel = roleLabelMap[roleKey] ?? role.name
	const statusLabel = isActive ? "Ativo" : "Inativo"

	const locationLabel = useMemo(() => {
		const city = address.city?.trim()
		const state = address.state?.trim()
		if (!city && !state) return "—"
		return `${city ?? ""}${city && state ? " / " : ""}${state ?? ""}`
	}, [address.city, address.state])

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8 p-0" aria-label="Visualizar usuário">
					<Eye className="h-4 w-4" />
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="sm:max-w-xl">
				<SheetHeader className="pb-0">
					<SheetTitle className="flex items-center gap-2">
						<UserIcon className="h-4 w-4 text-primary" />
						<span>{user.name || "Usuário sem nome"}</span>
					</SheetTitle>
					<SheetDescription>{user.email}</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-4 overflow-y-auto p-4 pt-0">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border bg-muted/40 p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<Shield className="h-3.5 w-3.5" />
								<span>Permissões</span>
							</div>
							<div className="mt-2 flex flex-wrap items-center gap-2">
								<Badge variant="outline" className="text-xs font-semibold">
									{roleLabel}
								</Badge>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span className={cn("h-2.5 w-2.5 rounded-full", isActive ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-600")} />
									<span>{statusLabel}</span>
								</div>
							</div>
						</div>

						<div className="rounded-lg border bg-muted/40 p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<CalendarClock className="h-3.5 w-3.5" />
								<span>Entrou em</span>
							</div>
							<p className="mt-2 text-sm font-medium text-foreground">{formatDateTime(createdAt)}</p>
						</div>
					</div>

					<div className="rounded-lg border bg-card p-3 shadow-sm">
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<Mail className="h-3.5 w-3.5" />
							<span>Contato</span>
						</div>
						<div className="mt-2 space-y-1">
							<p className="text-sm text-foreground">{user.email}</p>
							<p className="text-sm text-muted-foreground">{user.phone ? formatPhone(user.phone) : "Telefone não informado"}</p>
						</div>
					</div>

					<div className="rounded-lg border bg-card p-3 shadow-sm">
						<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<MapPin className="h-3.5 w-3.5" />
							<span>Endereço</span>
						</div>
						<div className="mt-2 space-y-1 text-sm">
							<p className="text-foreground">{locationLabel}</p>
							<p className="text-muted-foreground">{address.street ? `${address.street}${address.number ? `, ${address.number}` : ""}` : "Rua não informada"}</p>
							<p className="text-muted-foreground">{address.neighborhood || "Bairro não informado"}</p>
							<p className="text-muted-foreground">{address.complement?.trim() || "Complemento não informado"}</p>
							<p className="text-muted-foreground">CEP: {address.cep ? formatCep(address.cep) : "Não informado"}</p>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
