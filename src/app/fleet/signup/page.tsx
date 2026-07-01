// @/app/fleet/signup/page.tsx

import { RegisterAsDriverForm } from "@/modules/fleet/shared/ui/register-as-driver-form"
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Waves } from "@/shared/components/waves"
import { getRequestHost } from "@/shared/http/get-request-host"

export const dynamic = "force-dynamic"

const FleetSignupPage = async () => {
	// Resolve o host da requisição: a candidatura é vinculada à organização
	// dona do domínio atual (tenant resolvido no use-case a partir do host).
	const host = (await getRequestHost()) ?? "indisponível"

	return (
		<main className="relative min-h-screen overflow-hidden dark" style={{ colorScheme: "dark" }}>
			<Waves />

			<section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
				<Card className="w-full max-w-2xl border-white/10 bg-background/85 backdrop-blur shadow-lg">
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-3xl sm:text-4xl">Cadastro de motorista</CardTitle>
						<CardDescription className="text-base text-muted-foreground">Preencha seus dados, do seu veiculo e envie seus documentos para se candidatar a frota.</CardDescription>
						<p className="text-xs text-muted-foreground">
							Frota: <span className="font-medium text-foreground">{host}</span>
						</p>
					</CardHeader>

					<RegisterAsDriverForm />
				</Card>
			</section>
		</main>
	)
}

export default FleetSignupPage
