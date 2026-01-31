"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Waves } from "@/components/waves"

const DashboardLayoutError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
	const [isOffline, setIsOffline] = useState<boolean>(false)

	useEffect(() => {
		const updateStatus = () => setIsOffline(navigator.onLine === false)
		updateStatus()

		window.addEventListener("online", updateStatus)
		window.addEventListener("offline", updateStatus)

		return () => {
			window.removeEventListener("online", updateStatus)
			window.removeEventListener("offline", updateStatus)
		}
	}, [])

	return (
		<main className="relative min-h-screen overflow-hidden dark" style={{ colorScheme: "dark" }}>
			<Waves />

			<section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
				<Card className="w-full max-w-xl border-white/10 bg-background/85 backdrop-blur shadow-lg">
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-3xl sm:text-4xl">Algo deu errado</CardTitle>
						<CardDescription className="text-base text-muted-foreground">Estamos com instabilidade ao validar seu acesso. Tente novamente.</CardDescription>
						{isOffline && <CardDescription className="text-sm text-muted-foreground">Parece que você está sem internet.</CardDescription>}
					</CardHeader>

					<CardContent className="space-y-4">
						<Collapsible>
							<CollapsibleTrigger className="text-xs text-muted-foreground underline underline-offset-4">Detalhes técnicos</CollapsibleTrigger>
							<CollapsibleContent>
								<pre className="mt-3 whitespace-pre-wrap rounded-md border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">{error.message}</pre>
							</CollapsibleContent>
						</Collapsible>

						{error.digest && (
							<div className="text-[11px] text-muted-foreground">
								Digest: <span className="font-medium text-foreground">{error.digest}</span>
							</div>
						)}
					</CardContent>

					<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button className="w-full sm:w-auto" onClick={reset}>
							Tentar novamente
						</Button>
						<Button asChild variant="secondary" className="w-full sm:w-auto">
							<Link href="/">Voltar para o início</Link>
						</Button>
					</CardFooter>
				</Card>
			</section>
		</main>
	)
}

export default DashboardLayoutError
