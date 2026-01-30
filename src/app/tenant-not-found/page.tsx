import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves } from "@/components/waves"
import { getRequestHost } from "@/shared/http/get-request-host"

export const dynamic = "force-dynamic"

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? "https://wa.me/5599999999999"

export default async function TenantNotFoundPage() {
	const host = (await getRequestHost()) ?? "indisponível"
	const isDevEnvironment = process.env.NODE_ENV === "development"

	return (
		<main className="relative min-h-screen overflow-hidden">
			<Waves />

			<section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
				<Card className="w-full max-w-xl border-white/10 bg-background/85 backdrop-blur">
					<CardHeader className="space-y-3 text-center">
						<div className="flex justify-center">
							<Badge variant="outline" className="uppercase tracking-[0.2em] text-xs text-muted-foreground">
								Tenant guard
							</Badge>
						</div>
						<CardTitle className="text-3xl sm:text-4xl">Domínio não configurado</CardTitle>
						<CardDescription className="text-base text-muted-foreground">Não encontramos uma organização associada a este endereço.</CardDescription>
						<CardDescription className="text-sm text-muted-foreground">Se você digitou o endereço manualmente, verifique se está correto.</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
							Host detectado: <span className="font-medium text-foreground">{host}</span>
						</div>

						{isDevEnvironment && (
							<div className="rounded-md border border-dashed border-muted-foreground/50 bg-muted/30 px-4 py-3 text-left text-xs text-muted-foreground">
								Cadastre este host em organizations.app_domain para habilitar o tenant.
							</div>
						)}
					</CardContent>

					<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button asChild className="w-full sm:w-auto">
							<Link href="/">Voltar para o início</Link>
						</Button>
						<Button asChild variant="outline" className="w-full sm:w-auto">
							<a href={SUPPORT_URL} target="_blank" rel="noreferrer">
								Falar com suporte
							</a>
						</Button>
					</CardFooter>
				</Card>
			</section>
		</main>
	)
}
