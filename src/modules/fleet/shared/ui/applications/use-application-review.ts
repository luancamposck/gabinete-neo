"use client"

import { useCallback, useState } from "react"
import { toast } from "sonner"
import { approveDriverApplicationAction } from "@/modules/fleet/server/actions/approve-driver-application.action"
import { rejectDriverApplicationAction } from "@/modules/fleet/server/actions/reject-driver-application.action"

type ReviewAction = "approve" | "reject"

type UseApplicationReviewParams = {
	// Chamado com os ids resolvidos com sucesso, para que o container os remova da fila.
	onResolved: (applicationIds: string[]) => void
}

const runReviewAction = (applicationId: string, action: ReviewAction) => (action === "approve" ? approveDriverApplicationAction({ applicationId }) : rejectDriverApplicationAction({ applicationId }))

export const useApplicationReview = ({ onResolved }: UseApplicationReviewParams) => {
	const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set())
	const [isBulkPending, setIsBulkPending] = useState(false)

	const setPending = useCallback((applicationId: string, isPending: boolean) => {
		setPendingIds((previous) => {
			const next = new Set(previous)
			if (isPending) {
				next.add(applicationId)
			} else {
				next.delete(applicationId)
			}
			return next
		})
	}, [])

	const review = useCallback(
		async (applicationId: string, action: ReviewAction) => {
			setPending(applicationId, true)
			const result = await runReviewAction(applicationId, action)
			setPending(applicationId, false)

			if (result.success === false) {
				toast.error(result.message)
				return
			}

			toast.success(result.message)
			onResolved([applicationId])
		},
		[onResolved, setPending]
	)

	const approve = useCallback((applicationId: string) => review(applicationId, "approve"), [review])
	const reject = useCallback((applicationId: string) => review(applicationId, "reject"), [review])

	const reviewMany = useCallback(
		async (applicationIds: string[], action: ReviewAction) => {
			if (applicationIds.length === 0) return

			setIsBulkPending(true)
			const results = await Promise.allSettled(applicationIds.map((applicationId) => runReviewAction(applicationId, action)))
			setIsBulkPending(false)

			const succeeded: string[] = []
			for (const [index, result] of results.entries()) {
				if (result.status === "fulfilled" && result.value.success) {
					succeeded.push(applicationIds[index])
				}
			}

			const failedCount = applicationIds.length - succeeded.length
			const noun = action === "approve" ? "aprovada" : "rejeitada"

			if (succeeded.length > 0) {
				onResolved(succeeded)
			}

			if (failedCount === 0) {
				toast.success(`${succeeded.length} ${succeeded.length === 1 ? `candidatura ${noun}` : `candidaturas ${noun}s`}.`)
			} else if (succeeded.length > 0) {
				toast.warning(`${succeeded.length} ${noun}${succeeded.length === 1 ? "" : "s"}, ${failedCount} não puderam ser processadas.`)
			} else {
				toast.error("Não foi possível concluir a ação. Tente novamente.")
			}
		},
		[onResolved]
	)

	const approveMany = useCallback((applicationIds: string[]) => reviewMany(applicationIds, "approve"), [reviewMany])
	const rejectMany = useCallback((applicationIds: string[]) => reviewMany(applicationIds, "reject"), [reviewMany])

	return { approve, reject, approveMany, rejectMany, pendingIds, isBulkPending }
}

export type ApplicationReview = ReturnType<typeof useApplicationReview>
