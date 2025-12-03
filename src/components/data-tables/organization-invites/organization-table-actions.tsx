"use client"

import { Check, Loader2, MoreHorizontal, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { approveOrganizationInviteAction } from "@/actions/approve-organization-invite.action"
import { rejectOrganizationInviteAction } from "@/actions/reject-organization-invite.action"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { OrganizationInviteWithRequestedUser } from "@/types/organization-invite"

interface OrganizationTableActionsProps {
	invite: OrganizationInviteWithRequestedUser
}

export function OrganizationTableActions({ invite }: OrganizationTableActionsProps) {
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const isAlreadyProcessed = invite.status !== "PENDING"

	function handleApprove() {
		if (isAlreadyProcessed || isPending) return

		startTransition(async () => {
			const promise = approveOrganizationInviteAction(invite.id)

			toast.promise(promise, {
				loading: "Aprovando convite...",
				success: (res) => {
					if (res.success) {
						router.refresh() // Atualiza a tabela
						return "Convite aprovado com sucesso!"
					}
					throw new Error(res.message)
				},
				error: (error) => error.message || "Ocorreu um erro inesperado."
			})
		})
	}

	function handleReject() {
		if (isAlreadyProcessed || isPending) return

		startTransition(async () => {
			const promise = rejectOrganizationInviteAction(invite.id)

			toast.promise(promise, {
				loading: "Rejeitando convite...",
				success: (res) => {
					if (res.success) {
						router.refresh() // Atualiza a tabela
						return "Convite rejeitado com sucesso."
					}
					throw new Error(res.message)
				},
				error: (error) => error.message || "Ocorreu um erro inesperado."
			})
		})
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-8 w-8 p-0" disabled={isPending}>
					<span className="sr-only">Abrir menu de ações</span>
					{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel>Ações</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleApprove} disabled={isAlreadyProcessed || isPending} className={cn(!isAlreadyProcessed && "focus:bg-green-500/10 focus:text-green-600")}>
					<Check className="mr-2 h-4 w-4 text-green-600" />
					<span>Aprovar Convite</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleReject} disabled={isAlreadyProcessed || isPending} variant="destructive">
					<XCircle className="mr-2 h-4 w-4" />
					<span>Rejeitar</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
