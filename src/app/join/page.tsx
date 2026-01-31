// @/app/join/page.tsx

import Link from "next/link"
import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves } from "@/components/waves"
import { getCurrentUserAction } from "@/modules/auth/server/slices/get-current-user/actions/get-current-user.action"
import { signOutAction } from "@/modules/auth/server/slices/sign-out/actions/sign-out.action"
import { JoinOrganizationButton } from "@/modules/organizations/memberships/ui/join-organization-button"
import { getRequestHost } from "@/shared/http/get-request-host"

const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL ?? "https://wa.me/5599999999999"

export const dynamic = "force-dynamic"

const JoinPage = async () => {
	const authRes = await getCurrentUserAction()

	if (authRes.success === false) {
		if (authRes.code === "unauthenticated") {
			return redirect("/")
		}

		throw new Error(authRes.message)
	}

	const host = (await getRequestHost()) ?? "indisponível"
	const email = authRes.data.user.email ?? "indisponível"

	async function handleSignOut() {
		"use server"

		await signOutAction()
		redirect("/")
	}

	return (
		<main className="relative min-h-screen overflow-hidden">
			<Waves />

			<section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
			<Card className="w-full max-w-xl border-white/10 bg-background/85 backdrop-blur shadow-lg">
				<CardHeader className="space-y-2 text-center">
					<CardTitle className="text-3xl sm:text-4xl">Acesso restrito</CardTitle>
					<CardDescription className="text-base text-muted-foreground">Você está logado como {email} mas não pertence a esta constelação.</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="rounded-md border border-border/70 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
						Domínio atual: <span className="font-medium text-foreground">{host}</span>
					</div>

					<JoinOrganizationButton />
				</CardContent>

				<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<form action={handleSignOut} className="w-full sm:w-auto">
						<Button type="submit" variant="secondary" className="w-full sm:w-auto">
							Sair
						</Button>
					</form>
					<Button asChild variant="outline" className="w-full sm:w-auto">
						<Link href={SUPPORT_URL} target="_blank" rel="noreferrer">
							Falar com suporte
						</Link>
					</Button>
				</CardFooter>
			</Card>
			</section>
		</main>
	)
}

export default JoinPage
