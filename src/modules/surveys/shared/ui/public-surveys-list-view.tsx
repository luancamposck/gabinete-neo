import { ArrowRight, CalendarClock, ShieldCheck, UserRound } from "lucide-react"
import Link from "next/link"
import type { SurveyPublicListItemDTO } from "@/modules/surveys/shared/types/dto"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"

type PublicSurveysListViewProps = {
	surveys: SurveyPublicListItemDTO[]
}

type PublicSurveysListErrorStateProps = {
	title: string
	description: string
}

function formatDateLabel(date: string | null) {
	if (!date) {
		return "Sem prazo definido"
	}

	const parsedDate = new Date(date)
	if (Number.isNaN(parsedDate.getTime())) {
		return "Prazo indisponível"
	}

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(parsedDate)
}

function getDescriptionPreview(description: string | null) {
	if (!description) {
		return "Sem descrição adicional."
	}

	if (description.length <= 140) {
		return description
	}

	return `${description.slice(0, 137).trimEnd()}...`
}

export const PublicSurveysListView = ({ surveys }: PublicSurveysListViewProps) => {
	if (surveys.length === 0) {
		return (
			<main className="mx-auto flex min-h-svh w-full max-w-6xl items-center px-6 py-10">
				<Card className="w-full border-dashed">
					<CardHeader className="space-y-3 text-center">
						<Badge variant="outline" className="mx-auto">
							Pesquisas públicas
						</Badge>
						<CardTitle className="text-3xl">Nenhuma pesquisa disponível no momento</CardTitle>
						<CardDescription className="mx-auto max-w-2xl text-base">Quando este tenant publicar novas pesquisas dentro da janela de resposta, elas aparecerão aqui.</CardDescription>
					</CardHeader>
				</Card>
			</main>
		)
	}

	return (
		<main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-8 px-6 py-10">
			<section className="space-y-4">
				<Badge variant="outline">Pesquisas públicas</Badge>
				<div className="max-w-3xl space-y-3">
					<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Questionários abertos para este tenant</h1>
					<p className="text-base text-muted-foreground sm:text-lg">Escolha uma pesquisa disponível, revise as condições de resposta e envie sua participação sem precisar entrar no dashboard.</p>
				</div>
			</section>

			<section className="grid gap-4 lg:grid-cols-2">
				{surveys.map((survey) => (
					<Card key={survey.id} className="flex h-full flex-col">
						<CardHeader className="space-y-4">
							<div className="flex flex-wrap items-center gap-2">
								<Badge>{survey.status}</Badge>
								<Badge variant="outline">{survey.visibility}</Badge>
								<Badge variant={survey.acceptAnonymousAnswers ? "secondary" : "outline"}>{survey.acceptAnonymousAnswers ? "Aceita respostas anônimas" : "Exige identificação"}</Badge>
							</div>

							<div className="space-y-2">
								<CardTitle className="text-2xl">{survey.title}</CardTitle>
								<CardDescription className="text-base">{getDescriptionPreview(survey.description)}</CardDescription>
							</div>
						</CardHeader>

						<CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
							<div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
								<CalendarClock className="mt-0.5 size-4 shrink-0 text-foreground" />
								<div className="space-y-1">
									<p className="font-medium text-foreground">Prazo para responder</p>
									<p>{formatDateLabel(survey.endsAt)}</p>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
									<UserRound className="mt-0.5 size-4 shrink-0 text-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-foreground">Anônima ou identificada</p>
										<p>{survey.acceptAnonymousAnswers ? "Você decide como responder." : "A identificação do respondente é obrigatória."}</p>
									</div>
								</div>

								<div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
									<ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
									<div className="space-y-1">
										<p className="font-medium text-foreground">Status atual</p>
										<p>Disponível para respostas neste tenant.</p>
									</div>
								</div>
							</div>
						</CardContent>

						<CardFooter>
							<Button asChild className="w-full sm:w-auto">
								<Link href={`/surveys/${survey.id}`}>
									Responder pesquisa
									<ArrowRight />
								</Link>
							</Button>
						</CardFooter>
					</Card>
				))}
			</section>
		</main>
	)
}

export const PublicSurveysListErrorState = ({ title, description }: PublicSurveysListErrorStateProps) => {
	return (
		<main className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-6 py-10">
			<Card className="w-full">
				<CardHeader className="space-y-3">
					<Badge variant="outline">Pesquisas públicas</Badge>
					<CardTitle>{title}</CardTitle>
					<CardDescription className="text-base">{description}</CardDescription>
				</CardHeader>
			</Card>
		</main>
	)
}
