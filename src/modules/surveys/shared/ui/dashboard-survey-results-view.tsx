import { ArrowLeft, BarChart3, ListChecks, MessageSquareText, Sigma, Trophy, UserRound } from "lucide-react"
import Link from "next/link"
import type { SurveyDetailDTO, SurveyResultOptionDTO, SurveyResultQuestionDTO, SurveyResultsDTO, SurveyResultTextAnswerDTO } from "@/modules/surveys/shared/types/dto"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

type DashboardSurveyResultsViewProps = {
	organization: {
		id: string
		name: string
	}
	survey: SurveyDetailDTO
	results: SurveyResultsDTO
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

function formatPercentage(value: number | null) {
	if (value === null) {
		return "0%"
	}

	return `${value.toFixed(2).replace(".", ",")}%`
}

function getStatusLabel(status: SurveyDetailDTO["status"]) {
	switch (status) {
		case "draft":
			return "Rascunho"
		case "published":
			return "Publicada"
		case "closed":
			return "Encerrada"
	}
}

function getQuestionTypeLabel(type: SurveyResultQuestionDTO["type"]) {
	switch (type) {
		case "single_choice":
			return "Escolha única"
		case "checkbox":
			return "Múltipla escolha"
		case "ranking":
			return "Ranking"
		case "textarea":
			return "Texto livre"
	}
}

function getQuestionTypeDescription(question: SurveyResultQuestionDTO) {
	switch (question.type) {
		case "single_choice":
			return "Distribuição de respostas por alternativa selecionada."
		case "checkbox":
			return "Quantidade de respondentes que marcaram cada opção."
		case "ranking":
			return "Posição média de cada opção entre os rankings enviados."
		case "textarea":
			return "Respostas qualitativas com identidade exibida apenas quando permitida."
	}
}

function getQuestionTypeIcon(type: SurveyResultQuestionDTO["type"]) {
	switch (type) {
		case "single_choice":
			return BarChart3
		case "checkbox":
			return ListChecks
		case "ranking":
			return Trophy
		case "textarea":
			return MessageSquareText
	}
}

function getResponseModeLabel(survey: SurveyDetailDTO) {
	return survey.acceptAnonymousAnswers ? "Aceita respostas anônimas" : "Exige identificação"
}

type SummaryCardProps = {
	title: string
	value: string
	description: string
}

const SummaryCard = ({ title, value, description }: SummaryCardProps) => {
	return (
		<Card>
			<CardHeader className="space-y-2">
				<CardDescription>{title}</CardDescription>
				<CardTitle className="text-3xl">{value}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	)
}

type OptionResultRowProps = {
	option: SurveyResultOptionDTO
	isRanking: boolean
}

const OptionResultRow = ({ option, isRanking }: OptionResultRowProps) => {
	const width = option.percentage ?? 0

	return (
		<div className="space-y-3 rounded-xl border bg-background p-4">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<p className="font-medium text-foreground">{option.label}</p>
					<p className="text-sm text-muted-foreground">{option.value}</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Badge variant="outline">{option.responseCount} respostas</Badge>
					<Badge variant="secondary">{formatPercentage(option.percentage)}</Badge>
					{isRanking && option.averageRank !== null ? <Badge>{`Rank médio ${option.averageRank.toFixed(2).replace(".", ",")}`}</Badge> : null}
				</div>
			</div>

			<div className="h-2 overflow-hidden rounded-full bg-muted">
				<div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(0, Math.min(width, 100))}%` }} />
			</div>
		</div>
	)
}

function getRespondentLabel(answer: SurveyResultTextAnswerDTO) {
	if (answer.isAnonymous) {
		return "Resposta anônima"
	}

	if (answer.respondent.respondentName) {
		return answer.respondent.respondentName
	}

	if (answer.respondent.respondentEmail) {
		return answer.respondent.respondentEmail
	}

	if (answer.respondent.respondentUserId) {
		return "Respondente autenticado"
	}

	return "Respondente identificado"
}

function getRespondentDetails(answer: SurveyResultTextAnswerDTO) {
	if (answer.isAnonymous) {
		return "Os campos de identidade foram mascarados pela safe view."
	}

	const details = [answer.respondent.respondentEmail, answer.respondent.respondentPhone].filter(Boolean)

	if (details.length > 0) {
		return details.join(" • ")
	}

	if (answer.respondent.respondentUserId) {
		return "Resposta vinculada a um usuário autenticado."
	}

	return "Resposta identificada sem detalhes adicionais."
}

const TextAnswerCard = ({ answer }: { answer: SurveyResultTextAnswerDTO }) => {
	return (
		<div className="space-y-4 rounded-xl border bg-background p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={answer.isAnonymous ? "secondary" : "default"}>{answer.isAnonymous ? "Anônima" : "Identificada"}</Badge>
						<Badge variant="outline">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(answer.submittedAt))}</Badge>
					</div>
					<p className="font-medium text-foreground">{getRespondentLabel(answer)}</p>
					<p className="text-sm text-muted-foreground">{getRespondentDetails(answer)}</p>
				</div>
				<div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
					<UserRound className="size-4" />
					<span>{answer.responseId.slice(0, 8)}</span>
				</div>
			</div>

			<div className="rounded-lg bg-muted/30 p-4">
				<p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{answer.answerText}</p>
			</div>
		</div>
	)
}

const QuestionResultsCard = ({ question }: { question: SurveyResultQuestionDTO }) => {
	const Icon = getQuestionTypeIcon(question.type)

	return (
		<Card>
			<CardHeader className="space-y-4">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline">{`Pergunta ${question.position}`}</Badge>
					<Badge variant="secondary">{getQuestionTypeLabel(question.type)}</Badge>
					<Badge variant={question.required ? "default" : "outline"}>{question.required ? "Obrigatória" : "Opcional"}</Badge>
					<Badge variant="outline">{`${question.totalResponses} respostas`}</Badge>
				</div>

				<div className="flex items-start gap-3">
					<div className="rounded-lg bg-muted p-2">
						<Icon className="size-5 text-foreground" />
					</div>
					<div className="space-y-2">
						<CardTitle className="text-2xl">{question.title}</CardTitle>
						<CardDescription className="text-base">{question.description ?? getQuestionTypeDescription(question)}</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{question.type === "textarea" ? (
					question.textAnswers.length > 0 ? (
						<div className="space-y-4">
							{question.textAnswers.map((answer) => (
								<TextAnswerCard key={answer.responseId} answer={answer} />
							))}
						</div>
					) : (
						<div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">Nenhuma resposta textual foi registrada para esta pergunta ainda.</div>
					)
				) : question.options.length > 0 ? (
					<div className="space-y-4">
						{question.options.map((option) => (
							<OptionResultRow key={option.optionId} option={option} isRanking={question.type === "ranking"} />
						))}
					</div>
				) : (
					<div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">Esta pergunta ainda não possui opções agregadas para exibição.</div>
				)}
			</CardContent>
		</Card>
	)
}

export const DashboardSurveyResultsView = ({ organization, survey, results }: DashboardSurveyResultsViewProps) => {
	return (
		<section className="space-y-6">
			<Button asChild variant="ghost" size="sm" className="w-fit">
				<Link href="/dashboard/surveys">
					<ArrowLeft className="size-4" />
					Voltar para pesquisas
				</Link>
			</Button>

			<Card>
				<CardHeader className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">Resultados da pesquisa</Badge>
						<Badge variant={survey.status === "published" ? "default" : survey.status === "closed" ? "secondary" : "outline"}>{getStatusLabel(survey.status)}</Badge>
						<Badge variant={survey.visibility === "public" ? "default" : "outline"}>{survey.visibility === "public" ? "Pública" : "Privada"}</Badge>
						<Badge variant={survey.acceptAnonymousAnswers ? "secondary" : "default"}>{getResponseModeLabel(survey)}</Badge>
					</div>
					<div className="space-y-2">
						<CardTitle className="text-3xl">{survey.title}</CardTitle>
						<CardDescription className="text-base">{survey.description ?? "Acompanhe os agregados quantitativos e as respostas qualitativas desta pesquisa."}</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-lg border bg-muted/20 p-4">
						<p className="font-medium text-foreground">Organização</p>
						<p>{organization.name}</p>
					</div>
					<div className="rounded-lg border bg-muted/20 p-4">
						<p className="font-medium text-foreground">Início</p>
						<p>{formatDate(survey.startsAt)}</p>
					</div>
					<div className="rounded-lg border bg-muted/20 p-4">
						<p className="font-medium text-foreground">Encerramento</p>
						<p>{formatDate(survey.endsAt)}</p>
					</div>
					<div className="rounded-lg border bg-muted/20 p-4">
						<p className="font-medium text-foreground">Perguntas</p>
						<p>{survey.questions.length} itens cadastrados</p>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<SummaryCard title="Respostas recebidas" value={String(results.totalResponses)} description="Total consolidado de envios únicos aceitos para esta pesquisa." />
				<SummaryCard
					title="Perguntas com dados"
					value={String(results.questions.filter((question) => question.totalResponses > 0).length)}
					description="Quantidade de perguntas que já possuem pelo menos uma resposta registrada."
				/>
				<SummaryCard
					title="Questões discursivas"
					value={String(results.questions.filter((question) => question.type === "textarea").length)}
					description="Perguntas abertas exibidas com identidade mascarada sempre que a resposta for anônima."
				/>
				<SummaryCard
					title="Questões objetivas"
					value={String(results.questions.filter((question) => question.type !== "textarea").length)}
					description="Perguntas de escolha única, múltipla escolha e ranking com agregação por opção."
				/>
			</div>

			{results.totalResponses === 0 ? (
				<Card className="border-dashed">
					<CardHeader className="space-y-3">
						<div className="flex items-center gap-2">
							<Sigma className="size-5 text-muted-foreground" />
							<Badge variant="outline">Sem respostas</Badge>
						</div>
						<CardTitle>Nenhuma resposta foi recebida ainda</CardTitle>
						<CardDescription className="text-base">Os blocos detalhados de resultados serão preenchidos automaticamente quando a primeira resposta válida for enviada para esta pesquisa.</CardDescription>
					</CardHeader>
				</Card>
			) : (
				<div className="space-y-4">
					{results.questions.map((question) => (
						<QuestionResultsCard key={question.questionId} question={question} />
					))}
				</div>
			)}
		</section>
	)
}
