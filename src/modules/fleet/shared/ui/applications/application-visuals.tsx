"use client"

import { Bike, Car, Caravan, Clock, FileText, FileX2, type LucideIcon, Sparkles, Truck } from "lucide-react"
import { VEHICLE_TYPE_LABELS } from "@/modules/fleet/shared/constants/vehicle-type"
import type { VehicleType } from "@/modules/fleet/shared/types/db"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/flows/get-pending-driver-applications.types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

// Documento aberto no preview inline (sheet). Fonte única do formato para
// todas as views (tabela, cards, cockpit).
export type PreviewDocument = {
	url: string
	label: string
	candidateName: string
}

export const VEHICLE_TYPE_ICONS: Record<VehicleType, LucideIcon> = {
	car: Car,
	motorcycle: Bike,
	van: Caravan,
	truck: Truck
}

export const VehicleTypeBadge = ({ type, className }: { type: VehicleType; className?: string }) => {
	const Icon = VEHICLE_TYPE_ICONS[type] ?? Car
	const label = VEHICLE_TYPE_LABELS[type] ?? type

	return (
		<Badge variant="secondary" className={className}>
			<Icon aria-hidden className="size-3" />
			{label}
		</Badge>
	)
}

type ApplicationAgeTone = "new" | "normal" | "urgent"

export type ApplicationAge = {
	days: number
	tone: ApplicationAgeTone
	label: string
}

const DAY_IN_MS = 86_400_000
const URGENT_THRESHOLD_DAYS = 3

// Idade da candidatura na fila. Regra de urgência (>= 3 dias) é intencionalmente
// simples e pode virar configuração de produto depois.
export const getApplicationAge = (createdAt: string): ApplicationAge => {
	const created = new Date(createdAt).getTime()
	if (Number.isNaN(created)) return { days: 0, tone: "normal", label: "" }

	const days = Math.max(0, Math.floor((Date.now() - created) / DAY_IN_MS))

	if (days <= 0) return { days, tone: "new", label: "Nova" }
	if (days >= URGENT_THRESHOLD_DAYS) return { days, tone: "urgent", label: `${days} dias na fila` }
	return { days, tone: "normal", label: days === 1 ? "1 dia na fila" : `${days} dias na fila` }
}

export const ApplicationAgeBadge = ({ createdAt }: { createdAt: string }) => {
	const age = getApplicationAge(createdAt)

	if (age.tone === "new") {
		return (
			<Badge className="border-transparent bg-info-subtle text-info-subtle-foreground">
				<Sparkles aria-hidden className="size-3" />
				{age.label}
			</Badge>
		)
	}

	if (age.tone === "urgent") {
		return (
			<Badge className="border-transparent bg-warning-subtle text-warning-subtle-foreground">
				<Clock aria-hidden className="size-3" />
				{age.label}
			</Badge>
		)
	}

	return <span className="text-xs text-muted-foreground">{age.label}</span>
}

export const formatApplicationDate = (value: string) => {
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value

	return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
}

type ApplicationDocumentsProps = {
	application: PendingDriverApplicationDTO
	onPreview: (document: PreviewDocument) => void
	className?: string
}

// Botões de documento (CRLV/CNH) reutilizados por tabela e cards. Abrem o
// preview inline em vez de navegar para nova aba.
export const ApplicationDocuments = ({ application, onPreview, className }: ApplicationDocumentsProps) => {
	const candidateName = application.candidate?.name ?? "Candidato"

	const documents: { label: string; url: string | null }[] = [
		{ label: "CRLV", url: application.crlvSignedUrl },
		{ label: "CNH", url: application.cnhSignedUrl }
	]

	return (
		<div className={className ?? "flex flex-wrap items-center gap-2"}>
			{documents.map((document) =>
				document.url ? (
					<Button key={document.label} type="button" size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-xs" onClick={() => onPreview({ url: document.url as string, label: document.label, candidateName })}>
						<FileText aria-hidden className="size-3.5" />
						{document.label}
					</Button>
				) : (
					<span key={document.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
						<FileX2 aria-hidden className="size-3.5" />
						{document.label} indisponível
					</span>
				)
			)}
		</div>
	)
}
