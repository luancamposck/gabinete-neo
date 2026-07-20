"use client"

import type { Row } from "@tanstack/react-table"
import { Check, ExternalLink, FileX2, Keyboard, Loader2, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils/cn"
import type { PendingDriverApplicationDTO } from "@/modules/fleet/shared/types/slices/get-pending-driver-applications.types"
import type { ApplicationReviewControls } from "@/modules/fleet/shared/ui/applications/application-inline-actions"
import { ApplicationAgeBadge, formatApplicationDate, VehicleTypeBadge } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { SignedDocumentFrame } from "@/modules/fleet/shared/ui/applications/signed-document-frame"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

type ApplicationReviewCockpitProps = {
	rows: Row<PendingDriverApplicationDTO>[]
	controls: ApplicationReviewControls
}

type DocumentTab = "crlv" | "cnh"

const DetailField = ({ label, value }: { label: string; value: string | number | null }) => (
	<div className="flex flex-col gap-0.5">
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="text-sm font-medium">{value ?? "—"}</dd>
	</div>
)

const isTypingTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false
	const tag = target.tagName
	return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}

export const ApplicationReviewCockpit = ({ rows, controls }: ApplicationReviewCockpitProps) => {
	// Índice como fonte da verdade: ao remover a candidatura ativa, o mesmo índice
	// passa a apontar para a próxima da fila — o "avançar automático" da triagem.
	const [activeIndex, setActiveIndex] = useState(0)
	const [docTab, setDocTab] = useState<DocumentTab>("crlv")
	const [isRejectOpen, setIsRejectOpen] = useState(false)

	const safeIndex = Math.min(activeIndex, Math.max(0, rows.length - 1))
	// biome-ignore lint/correctness/useExhaustiveDependencies: reclampa quando o tamanho da fila muda
	useEffect(() => {
		if (activeIndex !== safeIndex) setActiveIndex(safeIndex)
	}, [safeIndex, activeIndex, rows.length])

	const activeRow = rows[safeIndex]
	const activeApplication = activeRow?.original ?? null
	const activeId = activeApplication?.applicationId

	// biome-ignore lint/correctness/useExhaustiveDependencies: reseta a aba de documento ao trocar de candidatura
	useEffect(() => {
		setDocTab("crlv")
	}, [activeId])

	// Mantém a candidatura ativa visível no rail ao navegar por teclado ou auto-avançar.
	const activeItemRef = useRef<HTMLLIElement>(null)
	// biome-ignore lint/correctness/useExhaustiveDependencies: reexecuta o scroll quando o índice ativo muda
	useEffect(() => {
		activeItemRef.current?.scrollIntoView({ block: "nearest" })
	}, [safeIndex])

	const isActivePending = activeId ? controls.pendingIds.has(activeId) : false

	const goNext = useCallback(() => setActiveIndex((index) => Math.min(index + 1, rows.length - 1)), [rows.length])
	const goPrevious = useCallback(() => setActiveIndex((index) => Math.max(index - 1, 0)), [])

	const rejectOpenRef = useRef(isRejectOpen)
	rejectOpenRef.current = isRejectOpen

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (isTypingTarget(event.target) || rejectOpenRef.current) return
			if (!activeApplication) return

			switch (event.key) {
				case "j":
				case "ArrowDown":
					event.preventDefault()
					goNext()
					break
				case "k":
				case "ArrowUp":
					event.preventDefault()
					goPrevious()
					break
				case "a":
					if (!controls.pendingIds.has(activeApplication.applicationId)) {
						event.preventDefault()
						controls.approve(activeApplication.applicationId)
					}
					break
				case "r":
					if (!controls.pendingIds.has(activeApplication.applicationId)) {
						event.preventDefault()
						setIsRejectOpen(true)
					}
					break
				default:
					break
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [activeApplication, controls, goNext, goPrevious])

	if (!activeApplication || !activeRow) {
		return <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">Nenhuma candidatura para os filtros atuais.</div>
	}

	const candidateName = activeApplication.candidate?.name ?? "Candidato desconhecido"
	const activeDocumentUrl = docTab === "crlv" ? activeApplication.crlvSignedUrl : activeApplication.cnhSignedUrl

	return (
		<div className="grid gap-4 lg:h-[calc(100dvh-13rem)] lg:min-h-[32rem] lg:grid-cols-[minmax(260px,320px)_1fr]">
			{/* Fila (master) */}
			<ul className="min-h-0 overflow-y-auto rounded-md border bg-card p-1.5" aria-label="Fila de candidaturas">
				{rows.map((row, index) => {
					const application = row.original
					const name = application.candidate?.name ?? "Candidato desconhecido"
					const isActive = index === safeIndex

					return (
						<li key={row.id} ref={isActive ? activeItemRef : undefined}>
							<div className={cn("flex items-start gap-2 rounded-sm px-2 py-2 transition-colors duration-[var(--duration-fast)] motion-reduce:transition-none", isActive ? "bg-accent" : "hover:bg-accent/50")}>
								<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label={`Selecionar candidatura de ${name}`} className="mt-1" />
								<button type="button" onClick={() => setActiveIndex(index)} className="flex min-w-0 flex-1 flex-col gap-1 text-left" aria-current={isActive}>
									<span className="truncate text-sm font-medium">{name}</span>
									<span className="flex items-center gap-2">
										<span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{application.plate}</span>
										<VehicleTypeBadge type={application.vehicleType} className="px-1.5 py-0.5" />
									</span>
									<ApplicationAgeBadge createdAt={application.createdAt} />
								</button>
							</div>
						</li>
					)
				})}
			</ul>

			{/* Detalhe (detail) */}
			<div className="flex min-h-0 flex-col overflow-hidden rounded-md border bg-card">
				<div className="flex flex-col gap-3 border-b p-4">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<h3 className="truncate text-lg font-semibold">{candidateName}</h3>
							<p className="truncate text-sm text-muted-foreground">{activeApplication.candidate?.email ?? "—"}</p>
						</div>
						<div className="flex flex-col items-end gap-1.5">
							<VehicleTypeBadge type={activeApplication.vehicleType} />
							<ApplicationAgeBadge createdAt={activeApplication.createdAt} />
						</div>
					</div>

					<dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
						<DetailField label="Placa" value={activeApplication.plate} />
						<DetailField label="Modelo" value={activeApplication.vehicleModel} />
						<DetailField label="Ano" value={activeApplication.vehicleYear} />
						<DetailField label="Cor" value={activeApplication.vehicleColor} />
					</dl>
					<span className="text-xs text-muted-foreground">Enviada em {formatApplicationDate(activeApplication.createdAt)}</span>
				</div>

				{/* Visualizador de documento sempre à vista */}
				<div className="flex items-center gap-2 border-b px-4 py-2">
					<Button type="button" size="sm" variant={docTab === "crlv" ? "secondary" : "ghost"} onClick={() => setDocTab("crlv")}>
						CRLV
					</Button>
					<Button type="button" size="sm" variant={docTab === "cnh" ? "secondary" : "ghost"} onClick={() => setDocTab("cnh")}>
						CNH
					</Button>
					{activeDocumentUrl && (
						<Button asChild size="sm" variant="ghost" className="ml-auto text-muted-foreground">
							<a href={activeDocumentUrl} target="_blank" rel="noopener noreferrer">
								<ExternalLink aria-hidden />
								Nova aba
							</a>
						</Button>
					)}
				</div>

				<div className="min-h-[20rem] flex-1 bg-muted/40">
					{activeDocumentUrl ? (
						<SignedDocumentFrame key={`${activeId}-${docTab}`} url={activeDocumentUrl} title={`${docTab.toUpperCase()} — ${candidateName}`} />
					) : (
						<div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
							<FileX2 aria-hidden className="size-6" />
							{docTab.toUpperCase()} indisponível
						</div>
					)}
				</div>

				{/* Barra de ação */}
				<div className="flex items-center gap-2 border-t p-3">
					<Button
						type="button"
						disabled={isActivePending}
						onClick={() => controls.approve(activeApplication.applicationId)}
						className="flex-1 bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/40"
					>
						{isActivePending ? <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" /> : <Check aria-hidden />}
						Aprovar
					</Button>
					<Button type="button" variant="destructive" disabled={isActivePending} onClick={() => setIsRejectOpen(true)} className="flex-1">
						<X aria-hidden />
						Rejeitar
					</Button>
					<span className="ml-1 hidden items-center gap-1.5 text-xs text-muted-foreground xl:flex">
						<Keyboard aria-hidden className="size-3.5" />
						<kbd className="rounded border bg-muted px-1 font-mono">j</kbd>
						<kbd className="rounded border bg-muted px-1 font-mono">k</kbd>
						navegar
						<kbd className="rounded border bg-muted px-1 font-mono">a</kbd>
						aprovar
						<kbd className="rounded border bg-muted px-1 font-mono">r</kbd>
						rejeitar
					</span>
				</div>
			</div>

			<Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rejeitar candidatura</DialogTitle>
						<DialogDescription>Tem certeza que deseja rejeitar a candidatura de {candidateName}? Esta ação não pode ser desfeita.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isActivePending}>
								Cancelar
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							disabled={isActivePending}
							onClick={() => {
								setIsRejectOpen(false)
								controls.reject(activeApplication.applicationId)
							}}
						>
							Rejeitar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
