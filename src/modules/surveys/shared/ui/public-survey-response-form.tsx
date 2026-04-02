"use client"

import { useId, useState } from "react"
import { toast } from "sonner"
import { submitSurveyResponseAction } from "@/modules/surveys/server/slices/submit-survey-response/actions/submit-survey-response.action"
import type { SurveyPublicDetailDTO } from "@/modules/surveys/shared/types/dto"
import type { SurveyAnswerInput } from "@/modules/surveys/shared/types/survey-question.types"
import { SurveyRenderer } from "@/modules/surveys/shared/ui/survey-renderer"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

type PublicSurveyResponseFormProps = {
	survey: SurveyPublicDetailDTO
}

type ResponseMode = "anonymous" | "identified"

function normalizeOptionalField(value: string) {
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
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

export const PublicSurveyResponseForm = ({ survey }: PublicSurveyResponseFormProps) => {
	const baseId = useId()
	const respondentNameId = `${baseId}-respondent-name`
	const respondentEmailId = `${baseId}-respondent-email`
	const respondentPhoneId = `${baseId}-respondent-phone`

	const [responseMode, setResponseMode] = useState<ResponseMode>(survey.acceptAnonymousAnswers ? "anonymous" : "identified")
	const [respondentName, setRespondentName] = useState("")
	const [respondentEmail, setRespondentEmail] = useState("")
	const [respondentPhone, setRespondentPhone] = useState("")
	const [submittedResponse, setSubmittedResponse] = useState<{ id: string; submittedAt: string } | null>(null)

	const canChooseAnonymous = survey.acceptAnonymousAnswers
	const isAnonymous = canChooseAnonymous ? responseMode === "anonymous" : false
	const canSubmit = survey.accessState === "accessible" && submittedResponse === null
	const shouldShowIdentityFields = !isAnonymous

	function validateBeforeSubmit() {
		if (isAnonymous) {
			return null
		}

		if (!normalizeOptionalField(respondentName) || !normalizeOptionalField(respondentEmail) || !normalizeOptionalField(respondentPhone)) {
			return "Informe nome, e-mail e telefone antes de enviar uma resposta identificada."
		}

		return null
	}

	async function handleSubmit(answers: SurveyAnswerInput[]) {
		const result = await submitSurveyResponseAction({
			surveyId: survey.id,
			isAnonymous,
			respondentName: isAnonymous ? null : normalizeOptionalField(respondentName),
			respondentEmail: isAnonymous ? null : normalizeOptionalField(respondentEmail),
			respondentPhone: isAnonymous ? null : normalizeOptionalField(respondentPhone),
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
			description: "Sua participação foi registrada nesta pesquisa."
		})
	}

	if (submittedResponse) {
		return (
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
		)
	}

	return (
		<SurveyRenderer
			questions={survey.questions}
			onSubmit={handleSubmit}
			submitLabel={canSubmit ? "Enviar respostas" : "Envio indisponível"}
			disabled={!canSubmit}
			disabledMessage={canSubmit ? null : "A pesquisa está visível para consulta, mas este estado bloqueia novas respostas."}
			validateBeforeSubmit={validateBeforeSubmit}
			beforeSubmitContent={
				<div className="space-y-4 rounded-xl border bg-muted/20 p-4">
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline">Identificação</Badge>
							<Badge variant={isAnonymous ? "secondary" : "default"}>{isAnonymous ? "Resposta anônima" : "Resposta identificada"}</Badge>
						</div>
						<p className="text-sm text-muted-foreground">
							{canChooseAnonymous
								? "Escolha se quer responder anonimamente ou compartilhar seus dados de contato antes do envio."
								: "Esta pesquisa não permite anonimato. Seus dados de contato são obrigatórios para concluir a resposta."}
						</p>
					</div>

					{canChooseAnonymous ? (
						<div className="grid gap-3 sm:grid-cols-2">
							<Button type="button" variant={isAnonymous ? "default" : "outline"} onClick={() => setResponseMode("anonymous")} disabled={!canSubmit}>
								Responder anonimamente
							</Button>
							<Button type="button" variant={!isAnonymous ? "default" : "outline"} onClick={() => setResponseMode("identified")} disabled={!canSubmit}>
								Responder com identificação
							</Button>
						</div>
					) : null}

					{shouldShowIdentityFields ? (
						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor={respondentNameId}>Nome</Label>
								<Input id={respondentNameId} value={respondentName} onChange={(event) => setRespondentName(event.target.value)} placeholder="Seu nome completo" disabled={!canSubmit} />
							</div>
							<div className="space-y-2">
								<Label htmlFor={respondentEmailId}>E-mail</Label>
								<Input id={respondentEmailId} type="email" value={respondentEmail} onChange={(event) => setRespondentEmail(event.target.value)} placeholder="voce@exemplo.com" disabled={!canSubmit} />
							</div>
							<div className="space-y-2">
								<Label htmlFor={respondentPhoneId}>Telefone</Label>
								<Input id={respondentPhoneId} value={respondentPhone} onChange={(event) => setRespondentPhone(event.target.value)} placeholder="(11) 99999-9999" disabled={!canSubmit} />
							</div>
						</div>
					) : (
						<Card>
							<CardContent className="pt-6">
								<p className="text-sm text-muted-foreground">No modo anônimo, nome, e-mail e telefone ficam ocultos e não serão enviados junto com sua resposta pública.</p>
							</CardContent>
						</Card>
					)}
				</div>
			}
		/>
	)
}
