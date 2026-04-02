"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { submitSurveyResponseAction } from "@/modules/surveys/server/slices/submit-survey-response/actions/submit-survey-response.action"
import type { SurveyDetailDTO } from "@/modules/surveys/shared/types/dto"
import type { SurveyAnswerInput } from "@/modules/surveys/shared/types/survey-question.types"
import { SurveyRenderer } from "@/modules/surveys/shared/ui/survey-renderer"
import { getSurveyResponseAccessState } from "@/modules/surveys/shared/utils/get-survey-response-access-state"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"

type DashboardSurveyDetailViewProps = {
	survey: SurveyDetailDTO
}

type ResponseMode = "anonymous" | "identified"

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

function formatSubmittedAt(date: string) {
	const parsedDate = new Date(date)
	if (Number.isNaN(parsedDate.getTime())) {
		return "agora"
	}

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(parsedDate)
}

function getAccessStateCopy(accessState: ReturnType<typeof getSurveyResponseAccessState>) {
	if (accessState === "draft") {
		return {
			badge: "Ainda em rascunho",
			title: "Esta pesquisa ainda não foi publicada",
			description: "Membros podem consultar a estrutura da pesquisa, mas o envio de respostas só será habilitado após a publicação."
		}
	}

	if (accessState === "closed") {
		return {
			badge: "Pesquisa encerrada",
			title: "Esta pesquisa foi encerrada",
			description: "As perguntas continuam visíveis para consulta, mas novos envios não são mais aceitos."
		}
	}

	if (accessState === "unavailable") {
		return {
			badge: "Fora da janela de resposta",
			title: "Esta pesquisa não está recebendo respostas agora",
			description: "Verifique as datas configuradas para início e encerramento antes de tentar responder."
		}
	}

	return {
		badge: "Disponível para resposta",
		title: "Responder pesquisa",
		description: "Use o mesmo renderer da experiência pública para revisar as perguntas e enviar sua participação pelo dashboard."
	}
}

function getVisibilityLabel(visibility: SurveyDetailDTO["visibility"]) {
	return visibility === "public" ? "Pública" : "Privada"
}

const DashboardSurveyDetailView = ({ survey }: DashboardSurveyDetailViewProps) => {
	const accessState = getSurveyResponseAccessState({
		survey: {
			status: survey.status,
			startsAt: survey.startsAt,
			endsAt: survey.endsAt
		}
	})

	const accessStateCopy = getAccessStateCopy(accessState)
	const canSubmit = accessState === "accessible"
	const canChooseAnonymous = survey.acceptAnonymousAnswers
	const [responseMode, setResponseMode] = useState<ResponseMode>(canChooseAnonymous ? "anonymous" : "identified")
	const [submittedResponse, setSubmittedResponse] = useState<{ id: string; submittedAt: string } | null>(null)

	const isAnonymous = canChooseAnonymous ? responseMode === "anonymous" : false

	async function handleSubmit(answers: SurveyAnswerInput[]) {
		const result = await submitSurveyResponseAction({
			surveyId: survey.id,
			isAnonymous,
			answers
		})

		if (result.success === false) {
			toast.error("Não foi possível enviar a resposta", {
				description: result.message
			})
			return
		}

		setSubmittedResponse({
			id: result.data.response.id,
			submittedAt: result.data.response.submittedAt
		})
		toast.success("Resposta enviada com sucesso", {
			description: "Sua participação foi registrada na pesquisa."
		})
	}

	if (submittedResponse) {
		return (
			<div className="space-y-6">
				<Button asChild variant="ghost" size="sm" className="w-fit">
					<Link href="/dashboard/surveys">
						<ArrowLeft className="size-4" />
						Voltar para pesquisas
					</Link>
				</Button>

				<Card className="border-dashed">
					<CardHeader>
						<div className="flex flex-wrap items-center gap-2">
							<Badge>Resposta registrada</Badge>
							<Badge variant="outline">{isAnonymous ? "Modo anônimo" : "Modo identificado"}</Badge>
						</div>
						<CardTitle>Participação concluída</CardTitle>
						<CardDescription className="text-base">Recebemos sua resposta em {formatSubmittedAt(submittedResponse.submittedAt)}. Esta sessão não exibirá um novo envio para evitar duplicidades.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<Button asChild variant="ghost" size="sm" className="w-fit">
				<Link href="/dashboard/surveys">
					<ArrowLeft className="size-4" />
					Voltar para pesquisas
				</Link>
			</Button>

			<Card>
				<CardHeader className="gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={survey.status === "published" ? "default" : survey.status === "closed" ? "secondary" : "outline"}>
							{survey.status === "published" ? "Publicada" : survey.status === "closed" ? "Encerrada" : "Rascunho"}
						</Badge>
						<Badge variant={survey.visibility === "public" ? "default" : "outline"}>{getVisibilityLabel(survey.visibility)}</Badge>
						<Badge variant={survey.acceptAnonymousAnswers ? "default" : "secondary"}>{survey.acceptAnonymousAnswers ? "Aceita respostas anônimas" : "Resposta identificada por conta"}</Badge>
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
						onSubmit={handleSubmit}
						submitLabel="Enviar respostas"
						showSubmitButton={canSubmit}
						disabled={!canSubmit}
						disabledMessage={canSubmit ? null : "O envio fica oculto enquanto a pesquisa estiver em rascunho, encerrada ou fora da janela configurada."}
						beforeSubmitContent={
							<div className="space-y-4 rounded-xl border bg-muted/20 p-4">
								<div className="space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant="outline">Identificação</Badge>
										<Badge variant={isAnonymous ? "secondary" : "default"}>{isAnonymous ? "Resposta anônima" : "Resposta com sua conta"}</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										{canChooseAnonymous
											? "Escolha se quer responder anonimamente ou associar a resposta ao seu usuário autenticado antes do envio."
											: "Esta pesquisa exige identificação. A resposta será vinculada ao membro autenticado que estiver usando o dashboard."}
									</p>
								</div>

								{canChooseAnonymous ? (
									<div className="grid gap-3 sm:grid-cols-2">
										<Button type="button" variant={isAnonymous ? "default" : "outline"} onClick={() => setResponseMode("anonymous")} disabled={!canSubmit}>
											Responder anonimamente
										</Button>
										<Button type="button" variant={!isAnonymous ? "default" : "outline"} onClick={() => setResponseMode("identified")} disabled={!canSubmit}>
											Responder com minha conta
										</Button>
									</div>
								) : null}
							</div>
						}
					/>
				</CardContent>
			</Card>
		</div>
	)
}

export { DashboardSurveyDetailView }
