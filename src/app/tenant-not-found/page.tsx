import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves } from "@/components/waves"

import { signOutAction } from "@/modules/auth/server/slices/sign-out/actions/sign-out.action"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { getRequestHost } from "@/shared/http/get-request-host"

export const dynamic = "force-dynamic"

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? "https://wa.me/5599999999999"

type TenantNotFoundPageProps = {
	searchParams: Record<string, string | string[] | undefined>
}

const TenantNotFoundPage = async ({ searchParams }: TenantNotFoundPageProps) => {
	const normalizedHost = await getRequestHost()

	const host = normalizedHost ?? "indisponível"
	const isDevEnvironment = process.env.NODE_ENV === "development"
	const fromParam = Array.isArray(searchParams.from) ? searchParams.from[0] : searchParams.from
	const autotryParam = Array.isArray(searchParams.autotry) ? searchParams.autotry[0] : searchParams.autotry
	const fromGuard = fromParam === "guard"
	const autotry = autotryParam === "1"

	if (!fromGuard && !autotry && normalizedHost) {
		const orgRes = await getOrganizationIdByAppDomainAction({ appDomain: normalizedHost })
		if (orgRes.success === true) {
			redirect("/dashboard?autotry=1")
		}
	}

	async function handleSignOut() {
		"use server"

		await signOutAction()
		redirect("/")
	}

	return (
		<main className="relative min-h-screen overflow-hidden dark" style={{ colorScheme: "dark" }}>
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
							<Link href="/dashboard">Tentar novamente</Link>
						</Button>
						<form action={handleSignOut} className="w-full sm:w-auto">
							<Button type="submit" variant="secondary" className="w-full sm:w-auto">
								Sair
							</Button>
						</form>
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

export default TenantNotFoundPage
