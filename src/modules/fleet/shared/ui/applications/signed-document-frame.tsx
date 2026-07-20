"use client"

import { AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"

type SignedDocumentFrameProps = {
	url: string
	title: string
	className?: string
}

type FrameStatus = "checking" | "ok" | "error"

// Confere se a signed URL do Storage ainda é válida antes de embutir no iframe.
// Sem essa checagem, um link expirado (Storage responde 400 InvalidJWT) renderiza
// o JSON de erro cru dentro do preview em vez de uma mensagem compreensível.
export const SignedDocumentFrame = ({ url, title, className }: SignedDocumentFrameProps) => {
	const [status, setStatus] = useState<FrameStatus>("checking")

	useEffect(() => {
		let cancelled = false
		setStatus("checking")

		fetch(url, { method: "HEAD", cache: "no-store" })
			.then((response) => {
				if (!cancelled) setStatus(response.ok || response.status === 405 ? "ok" : "error")
			})
			.catch(() => {
				if (!cancelled) setStatus("error")
			})

		return () => {
			cancelled = true
		}
	}, [url])

	if (status === "checking") {
		return <Skeleton className={cn("size-full rounded-none", className)} />
	}

	if (status === "error") {
		return (
			<div className={cn("flex size-full flex-col items-center justify-center gap-3 p-6 text-center", className)}>
				<AlertTriangle aria-hidden className="size-6 text-muted-foreground" />
				<div className="space-y-1">
					<p className="text-sm font-medium">Não foi possível carregar o documento</p>
					<p className="text-sm text-muted-foreground">O link pode ter expirado. Atualize a página para gerar um novo.</p>
				</div>
				<Button type="button" size="sm" variant="outline" onClick={() => window.location.reload()}>
					Atualizar página
				</Button>
			</div>
		)
	}

	return <iframe key={url} src={url} title={title} className={cn("size-full border-0", className)} />
}
