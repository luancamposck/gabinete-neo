import type { SurveyPublicDetailDTO } from "@/modules/surveys/shared/types/dto"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

type PublicSurveyDetailViewProps = {
	survey: SurveyPublicDetailDTO
}

type PublicSurveyDetailErrorStateProps = {
	title: string
	description: string
}

function formatDate(date: string | null) {
	if (!date) {
		return "Sem data definida"
	}

	const parsedDate = new Date(date)
	if (Number.isNaN(parsedDate.getTime())) {
		return "Data inválida"
	}

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(parsedDate)
}

export const PublicSurveyDetailView = ({ survey }: PublicSurveyDetailViewProps) => {
	return (
		<div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
			<Card>
				<CardHeader className="gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">{survey.status}</Badge>
						<Badge variant="outline">{survey.visibility}</Badge>
						<Badge variant={survey.acceptAnonymousAnswers ? "default" : "secondary"}>{survey.acceptAnonymousAnswers ? "Aceita respostas anônimas" : "Exige identificação"}</Badge>
					</div>
					<div className="space-y-2">
						<CardTitle className="text-3xl">{survey.title}</CardTitle>
						{survey.description ? <CardDescription className="text-base">{survey.description}</CardDescription> : null}
					</div>
				</CardHeader>

				<CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
					<div className="rounded-lg border bg-muted/30 p-4">
						<p className="font-medium text-foreground">Início</p>
						<p>{formatDate(survey.startsAt)}</p>
					</div>
					<div className="rounded-lg border bg-muted/30 p-4">
						<p className="font-medium text-foreground">Encerramento</p>
						<p>{formatDate(survey.endsAt)}</p>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4">
				{survey.questions.map((question) => (
					<Card key={question.id}>
						<CardHeader className="gap-2">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="outline">Pergunta {question.position}</Badge>
								<Badge variant="secondary">{question.type}</Badge>
								{question.required ? <Badge>Obrigatória</Badge> : <Badge variant="secondary">Opcional</Badge>}
							</div>
							<CardTitle className="text-xl">{question.title}</CardTitle>
							{question.description ? <CardDescription>{question.description}</CardDescription> : null}
						</CardHeader>

						<CardContent className="space-y-3">
							{question.options.length > 0 ? (
								<ul className="space-y-2">
									{question.options.map((option) => (
										<li key={option.id} className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
											<span className="font-medium">{option.position}.</span> {option.label}
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-muted-foreground">Resposta aberta.</p>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}

export const PublicSurveyDetailErrorState = ({ title, description }: PublicSurveyDetailErrorStateProps) => {
	return (
		<main className="mx-auto flex min-h-svh w-full max-w-2xl items-center px-6 py-10">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription className="text-base">{description}</CardDescription>
				</CardHeader>
			</Card>
		</main>
	)
}
