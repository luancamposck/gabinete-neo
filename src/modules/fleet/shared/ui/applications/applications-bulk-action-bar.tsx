"use client"

import { Check, Loader2, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

type ApplicationsBulkActionBarProps = {
	selectedCount: number
	isPending: boolean
	onApprove: () => void
	onReject: () => void
	onClear: () => void
}

export const ApplicationsBulkActionBar = ({ selectedCount, isPending, onApprove, onReject, onClear }: ApplicationsBulkActionBarProps) => {
	const [isRejectOpen, setIsRejectOpen] = useState(false)

	if (selectedCount === 0) return null

	const label = selectedCount === 1 ? "1 selecionada" : `${selectedCount} selecionadas`

	return (
		<section aria-label="Ações em lote" className="sticky inset-x-0 bottom-4 z-20 mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border bg-card/95 p-1.5 pl-4 shadow-lg backdrop-blur">
			<span className="text-sm font-medium whitespace-nowrap">{label}</span>

			<Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={isPending} className="text-muted-foreground">
				Limpar
			</Button>

			<div className="flex items-center gap-2">
				<Button type="button" size="sm" disabled={isPending} onClick={onApprove} className="rounded-full bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/40">
					{isPending ? <Loader2 aria-hidden className="animate-spin motion-reduce:animate-none" /> : <Check aria-hidden />}
					Aprovar
				</Button>

				<Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
					<Button type="button" size="sm" variant="destructive" disabled={isPending} onClick={() => setIsRejectOpen(true)} className="rounded-full">
						<X aria-hidden />
						Rejeitar
					</Button>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>Rejeitar candidaturas</DialogTitle>
							<DialogDescription>Tem certeza que deseja rejeitar {label.toLowerCase()}? Esta ação não pode ser desfeita.</DialogDescription>
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
									onReject()
								}}
							>
								Rejeitar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</section>
	)
}
