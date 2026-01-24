// @/modules/organizations/referrals/ui/my-referral-link-button.tsx
"use client"

import { Check, Clipboard, Loader2 } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getMyReferralLinkAction } from "@/modules/organizations/referrals/server/slices/get-my-referral-link/actions/get-my-referral-link.action"

type Props = {
	className?: string
	storageKey?: string // se quiser customizar
}

export const MyReferralLinkButton = ({ className, storageKey = "gabinete:my_referral_link" }: Props) => {
	const [isPending, startTransition] = useTransition()
	const [referralUrl, setReferralUrl] = useState<string>("")
	const [copied, setCopied] = useState(false)
	const resetTimerRef = useRef<number | null>(null)

	useEffect(() => {
		// opcional: cache persistente (pra chamar server action só 1x)
		const cached = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null
		if (cached) setReferralUrl(cached)

		return () => {
			if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
		}
	}, [storageKey])

	function scheduleResetCopied() {
		if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current)
		resetTimerRef.current = window.setTimeout(() => {
			setCopied(false)
		}, 4000)
	}

	async function copyToClipboard(url: string) {
		await navigator.clipboard.writeText(url)
		setCopied(true)
		scheduleResetCopied()
	}

	async function handleClick() {
		try {
			// Se já temos o link, só copia
			if (referralUrl) {
				await copyToClipboard(referralUrl)
				toast.success("Link copiado com sucesso")
				return
			}

			startTransition(async () => {
				const res = await getMyReferralLinkAction()

				if (!res || res.success === false || !res.data?.referralUrl) {
					toast.error("Não foi possível gerar seu link.", {
						description: res?.message ?? "Tente novamente em alguns instantes."
					})
					return
				}

				const url = res.data.referralUrl
				setReferralUrl(url)
				window.localStorage.setItem(storageKey, url)

				await copyToClipboard(url)
				toast.success("Link copiado com sucesso")
			})
		} catch (err) {
			console.error("[MyReferralLinkButton] Error:", err)
			toast.error("Erro ao copiar o link.", {
				description: err instanceof Error ? err.message : "Tente novamente em alguns instantes."
			})
		}
	}

	const loading = isPending
	const label = copied ? "Link copiado com sucesso" : loading ? "Gerando..." : "Clique para copiar"

	const Icon = copied ? Check : loading ? Loader2 : Clipboard

	return (
		<Button type="button" variant="outline" onClick={handleClick} disabled={loading} className={cn("gap-2", className)}>
			<span>{label}</span>
			<Icon className={cn("h-4 w-4", loading && "animate-spin")} />
		</Button>
	)
}
