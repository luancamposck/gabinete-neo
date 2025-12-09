// src/components/invite/invite-link-box.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { generateInviteLinkUseCaseAction } from "@/actions/use-cases/generate-invite-link.use.case.action"
import { cn } from "@/lib/utils"

interface InviteLinkBoxProps {
	className?: string
}

export const InviteLinkBox = ({ className }: InviteLinkBoxProps) => {
	const [inviteUrl, setInviteUrl] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)

	async function handleClick() {
		try {
			setIsLoading(true)

			let url = inviteUrl

			if (!url) {
				const res = await generateInviteLinkUseCaseAction()

				if (!res || !res.success || !res.data.inviteLink) {
					toast.error("Não foi possível gerar o link de convite.", {
						description: res?.message ?? "Tente novamente em alguns instantes."
					})
					return
				}

				url = res.data.inviteLink
				setInviteUrl(url)
			}

			await navigator.clipboard.writeText(url)

			toast.success("Link de convite copiado!", {
				description: "O link foi copiado para a área de transferência."
			})
		} catch (error) {
			console.error("[InviteLinkBox] Erro ao gerar/copiar link:", error)
			toast.error("Erro ao copiar o link de convite.", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		} finally {
			setIsLoading(false)
		}
	}

	const mainText = inviteUrl ? "Link de convite gerado. Clique para copiar novamente." : isLoading ? "Gerando link de convite..." : "Clique aqui para gerar e copiar seu link de convite"

	return (
		<button
			type="button"
			onClick={handleClick}
			className={cn("flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-muted", isLoading && "opacity-70 cursor-wait", className)}
		>
			<div className="flex flex-col">
				<span>{mainText}</span>
			</div>
			<span className="ml-3 text-xs text-muted-foreground shrink-0">{inviteUrl ? "Copiar link" : "Gerar link"}</span>
		</button>
	)
}
