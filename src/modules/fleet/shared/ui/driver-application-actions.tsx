"use client"

import { Check, X } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { approveDriverApplicationAction } from "@/modules/fleet/server/slices/review-driver-applications/actions/approve-driver-application.action"
import { rejectDriverApplicationAction } from "@/modules/fleet/server/slices/review-driver-applications/actions/reject-driver-application.action"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"

type DriverApplicationActionsProps = {
	applicationId: string
	candidateName: string
}

export const DriverApplicationActions = ({ applicationId, candidateName }: DriverApplicationActionsProps) => {
	const [isPending, startTransition] = useTransition()
	const [isRejectOpen, setIsRejectOpen] = useState(false)

	const handleApprove = () => {
		startTransition(async () => {
			const result = await approveDriverApplicationAction({ applicationId })

			if (result.success === false) {
				toast.error(result.message)
				return
			}

			toast.success(result.message)
		})
	}

	const handleReject = () => {
		startTransition(async () => {
			const result = await rejectDriverApplicationAction({ applicationId })

			if (result.success === false) {
				toast.error(result.message)
				return
			}

			setIsRejectOpen(false)
			toast.success(result.message)
		})
	}

	return (
		<div className="flex flex-wrap gap-2">
			<Button disabled={isPending} onClick={handleApprove} size="sm">
				<Check />
				Aprovar
			</Button>

			<Dialog onOpenChange={setIsRejectOpen} open={isRejectOpen}>
				<Button disabled={isPending} onClick={() => setIsRejectOpen(true)} size="sm" variant="outline">
					<X />
					Rejeitar
				</Button>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rejeitar candidatura</DialogTitle>
						<DialogDescription>Tem certeza que deseja rejeitar a candidatura de {candidateName}? Esta ação não pode ser desfeita.</DialogDescription>
					</DialogHeader>

					<DialogFooter>
						<DialogClose asChild>
							<Button disabled={isPending} type="button" variant="outline">
								Cancelar
							</Button>
						</DialogClose>
						<Button disabled={isPending} onClick={handleReject} type="button" variant="destructive">
							Rejeitar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
