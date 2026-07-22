// @/modules/auth/shared/ui/auth-tabs-client.tsx
"use client"

import Image from "next/image"
import { useState } from "react"
import { RegisterAndJoinForm } from "@/modules/accounts/onboarding/shared/ui/register-and-join-form"
import { SignInForm } from "@/modules/auth/shared/ui/sign-in-form"
import { Card } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

type AuthTabsClientProps = {
	organizationName: string
	imageUrl: string
	initialTab: "login" | "signup"
}

export const AuthTabsClient = ({ organizationName, imageUrl, initialTab }: AuthTabsClientProps) => {
	// Tabs controladas: permite o link "Cadastre-se" do login trocar de aba e
	// mantém a aba inicial derivada de `?ref` (calculada no server).
	const [tab, setTab] = useState<string>(initialTab)

	return (
		<Tabs value={tab} onValueChange={setTab} className="w-full max-w-sm gap-4 md:max-w-3xl">
			{/* Identidade do tenant — cabeçalho compacto (somente mobile).
			    No desktop a identidade vive no painel lateral do card.
			    Logo num chip claro para legibilidade sobre o gradiente. */}
			<div className="flex flex-col items-center gap-2 md:hidden">
				<div className="rounded-2xl bg-auth-panel-foreground p-2 shadow-sm">
					<Image src={imageUrl} width={128} height={128} alt={organizationName} className="size-12 rounded-xl object-contain" priority />
				</div>
				<h1 className="text-center text-lg font-semibold text-balance">{organizationName}</h1>
			</div>

			<TabsList className="w-full">
				<TabsTrigger value="login">Login</TabsTrigger>
				<TabsTrigger value="signup">Cadastro</TabsTrigger>
			</TabsList>

			<Card className="grid grid-cols-1 overflow-hidden p-0 shadow-xl md:grid-cols-2">
				<TabsContent value="login">
					<SignInForm organizationName={organizationName} onSwitchToSignup={() => setTab("signup")} />
				</TabsContent>
				<TabsContent value="signup">
					<RegisterAndJoinForm />
				</TabsContent>

				{/* Painel de marca (split-auth, somente desktop) — mesmo conteúdo nas
				    duas abas. Navy profundo (--auth-panel) com logo em chip claro. */}
				<div className="relative hidden overflow-hidden bg-auth-panel text-auth-panel-foreground md:flex md:flex-col md:items-center md:justify-center md:gap-5 md:p-10">
					<div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,var(--auth-glow),transparent_65%)]" />
					<div className="relative rounded-3xl bg-auth-panel-foreground p-5 shadow-lg">
						<Image src={imageUrl} width={300} height={300} alt={organizationName} className="size-28 rounded-2xl object-contain" />
					</div>
					<h2 className="relative text-center text-2xl font-semibold tracking-tight text-balance">{organizationName}</h2>
					<p className="relative max-w-[26ch] text-center text-sm text-auth-panel-foreground/70 text-balance">Acesse o painel do seu gabinete.</p>
				</div>
			</Card>
		</Tabs>
	)
}
