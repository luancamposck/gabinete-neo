import { AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type InviteErrorProps = {
	title: string
	description?: string
}

export const InviteError = ({ title, description }: InviteErrorProps) => {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-col items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
						<AlertCircle className="h-6 w-6 text-destructive" />
					</div>

					<CardTitle className="text-center text-xl sm:text-2xl">{title}</CardTitle>

					{description && <CardDescription className="text-center">{description}</CardDescription>}
				</CardHeader>

				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p>Tente as opções abaixo:</p>
					<ul className="list-disc space-y-1 pl-5">
						<li>Verifique se o link foi copiado corretamente.</li>
						<li>Peça um novo link ao responsável pelo convite.</li>
					</ul>
				</CardContent>

				<CardFooter className="flex">
					<Button variant="outline" asChild className="w-full">
						<Link href="/">Voltar para a página inicial</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
