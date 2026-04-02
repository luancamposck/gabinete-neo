import type { SurveyPublicDetailDTO } from "@/modules/surveys/shared/types/dto"
import { SurveyRenderer } from "@/modules/surveys/shared/ui/survey-renderer"
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

function getAccessStateCopy(survey: SurveyPublicDetailDTO) {
	if (survey.accessState === "closed") {
		return {
			badge: "Pesquisa encerrada",
			title: "Esta pesquisa foi encerrada",
			description: "As perguntas continuam visíveis para consulta, mas o envio de respostas não está mais disponível."
		}
	}

	if (survey.accessState === "unavailable") {
		return {
			badge: "Indisponível no momento",
			title: "Esta pesquisa ainda não está aceitando respostas",
			description: "Confira as datas de início e encerramento antes de tentar responder."
		}
	}

	return {
		badge: "Disponível para resposta",
		title: "Responda à pesquisa",
		description: survey.acceptAnonymousAnswers
			? "A etapa de identidade e o envio final serão conectados nas próximas histórias do fluxo público."
			: "Esta pesquisa exige identificação e terá essa etapa conectada nas próximas histórias do fluxo público."
	}
}

export const PublicSurveyDetailView = ({ survey }: PublicSurveyDetailViewProps) => {
	const accessStateCopy = getAccessStateCopy(survey)
	const canSubmit = survey.accessState === "accessible"

	return (
		<div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 px-6 py-10">
			<Card>
				<CardHeader className="gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">{survey.status}</Badge>
						<Badge variant="outline">{survey.visibility}</Badge>
						<Badge variant={survey.acceptAnonymousAnswers ? "default" : "secondary"}>{survey.acceptAnonymousAnswers ? "Aceita respostas anônimas" : "Exige identificação"}</Badge>
						<Badge variant={canSubmit ? "default" : "secondary"}>{accessStateCopy.badge}</Badge>
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

			<Card>
				<CardHeader>
					<CardTitle>{accessStateCopy.title}</CardTitle>
					<CardDescription className="text-base">{accessStateCopy.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<SurveyRenderer
						questions={survey.questions}
						onSubmit={async () => {}}
						submitLabel={canSubmit ? "Continuar para envio" : "Envio indisponível"}
						disabled={!canSubmit}
						disabledMessage={
							canSubmit ? "Esta shell já renderiza todos os tipos de pergunta; a submissão será conectada na próxima story." : "A pesquisa está visível para consulta, mas este estado bloqueia novas respostas."
						}
					/>
				</CardContent>
			</Card>
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
