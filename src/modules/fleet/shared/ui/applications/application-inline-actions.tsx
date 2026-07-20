"use client"

import { Check, Loader2, X } from "lucide-react"
import { useState } from "react"
import type { PreviewDocument } from "@/modules/fleet/shared/ui/applications/application-visuals"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

// Controles de revisão compartilhados por tabela, cards e cockpit.
export type ApplicationReviewControls = {
	approve: (applicationId: string) => void
	reject: (applicationId: string) => void
	pendingIds: Set<string>
	onPreviewDocument: (document: PreviewDocument) => void
}

type ApplicationInlineActionsProps = {
	applicationId: string
	candidateName: string
	controls: ApplicationReviewControls
	// "full" = botões com rótulo (cards/cockpit); "compact" = ícones (linha da tabela).
	layout?: "full" | "compact"
	className?: string
}

export const ApplicationInlineActions = ({ applicationId, candidateName, controls, layout = "full", className }: ApplicationInlineActionsProps) => {
	const [isRejectOpen, setIsRejectOpen] = useState(false)
	const isPending = controls.pendingIds.has(applicationId)
	const isCompact = layout === "compact"

	return (
		<div className={className ?? "flex items-center gap-2"}>
			<Button
				type="button"
				size={isCompact ? "icon" : "sm"}
				disabled={isPending}
				onClick={() => controls.approve(applicationId)}
				aria-label={isCompact ? `Aprovar candidatura de ${candidateName}` : undefined}
				className="bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/40"
			>
				{isPending ? <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" /> : <Check aria-hidden />}
				{!isCompact && "Aprovar"}
			</Button>

			<Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
				<Button
					type="button"
					size={isCompact ? "icon" : "sm"}
					variant="destructive"
					disabled={isPending}
					onClick={() => setIsRejectOpen(true)}
					aria-label={isCompact ? `Rejeitar candidatura de ${candidateName}` : undefined}
				>
					<X aria-hidden />
					{!isCompact && "Rejeitar"}
				</Button>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rejeitar candidatura</DialogTitle>
						<DialogDescription>Tem certeza que deseja rejeitar a candidatura de {candidateName}? Esta ação não pode ser desfeita.</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isPending}>
								Cancelar
							</Button>
						</DialogClose>
						<Button
							type="button"
							variant="destructive"
							disabled={isPending}
							onClick={() => {
								setIsRejectOpen(false)
								controls.reject(applicationId)
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
