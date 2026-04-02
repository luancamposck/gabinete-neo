"use client"

import { ArrowLeft, Lock, Save, Send, SquareTerminal } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { closeSurveyAction } from "@/modules/surveys/server/slices/close-survey/actions/close-survey.action"
import { publishSurveyAction } from "@/modules/surveys/server/slices/publish-survey/actions/publish-survey.action"
import { updateSurveyAction } from "@/modules/surveys/server/slices/update-survey/actions/update-survey.action"
import type { SurveyDetailDTO } from "@/modules/surveys/shared/types/dto"
import { SurveyBuilder, type SurveyBuilderValue } from "@/modules/surveys/shared/ui/survey-builder"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"

type ManageSurveyFormProps = {
	organization: {
		id: string
		name: string
	}
	survey: SurveyDetailDTO
	isStructureLocked: boolean
}

type SurveyStatusPresentation = {
	label: string
	variant: "default" | "secondary" | "outline"
}

function mapSurveyToBuilderValue(survey: SurveyDetailDTO): SurveyBuilderValue {
	return {
		title: survey.title,
		description: survey.description,
		visibility: survey.visibility,
		acceptAnonymousAnswers: survey.acceptAnonymousAnswers,
		startsAt: survey.startsAt,
		endsAt: survey.endsAt,
		questions: survey.questions.map((question) => ({
			id: question.id,
			title: question.title,
			description: question.description,
			type: question.type,
			required: question.required,
			position: question.position,
			configJson: question.configJson,
			options: question.options.map((option) => ({
				id: option.id,
				label: option.label,
				value: option.value,
				position: option.position
			}))
		}))
	}
}

function normalizeNullableText(value: string | null) {
	if (!value) {
		return null
	}

	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
}

function getStatusPresentation(status: SurveyDetailDTO["status"]): SurveyStatusPresentation {
	switch (status) {
		case "draft":
			return {
				label: "Rascunho",
				variant: "outline"
			}
		case "published":
			return {
				label: "Publicada",
				variant: "default"
			}
		case "closed":
			return {
				label: "Encerrada",
				variant: "secondary"
			}
	}
}

function getVisibilityLabel(visibility: SurveyDetailDTO["visibility"]) {
	return visibility === "public" ? "Pública" : "Privada"
}

function getActionAvailability(status: SurveyDetailDTO["status"]) {
	return {
		canPublish: status === "draft",
		canClose: status === "published"
	}
}

export const ManageSurveyForm = ({ organization, survey, isStructureLocked }: ManageSurveyFormProps) => {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [builderValue, setBuilderValue] = useState<SurveyBuilderValue>(() => mapSurveyToBuilderValue(survey))
	const [currentStatus, setCurrentStatus] = useState<SurveyDetailDTO["status"]>(survey.status)
	const [serverMessage, setServerMessage] = useState<string | null>(null)

	const statusPresentation = getStatusPresentation(currentStatus)
	const actionAvailability = getActionAvailability(currentStatus)

	const handleAuthBoundary = (code: string | undefined) => {
		switch (code) {
			case "unauthenticated":
				router.replace("/")
				return true
			case "organization_not_found":
			case "org_not_found":
				router.replace("/tenant-not-found")
				return true
			case "not_allowed":
			case "survey_not_found":
				router.replace("/dashboard/surveys")
				return true
			default:
				return false
		}
	}

	const handleSave = () => {
		setServerMessage(null)

		startTransition(async () => {
			try {
				const result = await updateSurveyAction({
					organizationId: organization.id,
					surveyId: survey.id,
					title: builderValue.title,
					description: normalizeNullableText(builderValue.description),
					visibility: builderValue.visibility,
					acceptAnonymousAnswers: builderValue.acceptAnonymousAnswers,
					startsAt: builderValue.startsAt,
					endsAt: builderValue.endsAt,
					questions: builderValue.questions.map((question) => ({
						...question,
						description: normalizeNullableText(question.description ?? null),
						options:
							question.type === "textarea"
								? []
								: question.options.map((option) => ({
										...option,
										label: option.label.trim(),
										value: option.value.trim()
									}))
					}))
				})

				if (result.success === false) {
					if (handleAuthBoundary(result.code)) {
						return
					}

					setServerMessage(result.message)
					toast.error("Não foi possível salvar a pesquisa", {
						description: result.message
					})
					return
				}

				setCurrentStatus(result.data.survey.status)
				toast.success("Pesquisa atualizada", {
					description: result.message
				})
				router.refresh()
			} catch (error) {
				const message = error instanceof Error ? error.message : "Tente novamente em alguns instantes."
				setServerMessage(message)
				toast.error("Erro inesperado ao salvar a pesquisa", {
					description: message
				})
			}
		})
	}

	const handlePublish = () => {
		setServerMessage(null)

		startTransition(async () => {
			try {
				const result = await publishSurveyAction({
					organizationId: organization.id,
					surveyId: survey.id
				})

				if (result.success === false) {
					if (handleAuthBoundary(result.code)) {
						return
					}

					setServerMessage(result.message)
					toast.error("Não foi possível publicar a pesquisa", {
						description: result.message
					})
					return
				}

				setCurrentStatus(result.data.survey.status)
				toast.success("Pesquisa publicada", {
					description: result.message
				})
				router.refresh()
			} catch (error) {
				const message = error instanceof Error ? error.message : "Tente novamente em alguns instantes."
				setServerMessage(message)
				toast.error("Erro inesperado ao publicar a pesquisa", {
					description: message
				})
			}
		})
	}

	const handleClose = () => {
		setServerMessage(null)

		startTransition(async () => {
			try {
				const result = await closeSurveyAction({
					organizationId: organization.id,
					surveyId: survey.id
				})

				if (result.success === false) {
					if (handleAuthBoundary(result.code)) {
						return
					}

					setServerMessage(result.message)
					toast.error("Não foi possível encerrar a pesquisa", {
						description: result.message
					})
					return
				}

				setCurrentStatus(result.data.survey.status)
				toast.success("Pesquisa encerrada", {
					description: result.message
				})
				router.refresh()
			} catch (error) {
				const message = error instanceof Error ? error.message : "Tente novamente em alguns instantes."
				setServerMessage(message)
				toast.error("Erro inesperado ao encerrar a pesquisa", {
					description: message
				})
			}
		})
	}

	return (
		<div className="space-y-6">
			<header className="space-y-3">
				<Button asChild variant="ghost" size="sm" className="w-fit">
					<Link href="/dashboard/surveys">
						<ArrowLeft className="size-4" />
						Voltar para pesquisas
					</Link>
				</Button>

				<div className="space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="outline">Gerenciar pesquisa</Badge>
						<Badge variant={statusPresentation.variant}>{statusPresentation.label}</Badge>
						<Badge variant={builderValue.visibility === "public" ? "default" : "secondary"}>{getVisibilityLabel(builderValue.visibility)}</Badge>
						{isStructureLocked ? <Badge variant="secondary">Estrutura travada</Badge> : <Badge variant="outline">Estrutura editável</Badge>}
					</div>
					<h1 className="text-3xl font-semibold tracking-tight">{builderValue.title || survey.title}</h1>
					<p className="max-w-3xl text-sm text-muted-foreground">
						Revise os metadados, ajuste a estrutura enquanto ainda não houver respostas e controle o ciclo de vida da pesquisa de {organization.name} sem sair desta tela.
					</p>
				</div>
			</header>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
				<Card>
					<CardHeader>
						<CardTitle>Editar configuração</CardTitle>
						<CardDescription>Metadados continuam editáveis em qualquer estado. Quando a pesquisa já possui respostas, a estrutura de perguntas e opções fica bloqueada para preservar o histórico.</CardDescription>
					</CardHeader>
					<CardContent>
						<SurveyBuilder value={builderValue} onChange={setBuilderValue} isStructureLocked={isStructureLocked} />

						{serverMessage ? <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{serverMessage}</div> : null}
					</CardContent>
					<CardFooter className="flex justify-end">
						<Button type="button" onClick={handleSave} disabled={isPending}>
							<Save className="size-4" />
							{isPending ? "Salvando..." : "Salvar alterações"}
						</Button>
					</CardFooter>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Estado da publicação</CardTitle>
							<CardDescription>As ações abaixo respeitam o estado atual da pesquisa e o contrato de transição do backend.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-lg border bg-muted/20 p-4">
								<p className="font-medium text-sm">Status atual</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{currentStatus === "draft" ? "Rascunho editável, ainda indisponível para respostas." : null}
									{currentStatus === "published" ? "Pesquisa publicada e apta a receber respostas conforme a janela de disponibilidade." : null}
									{currentStatus === "closed" ? "Pesquisa encerrada. Novas respostas não devem mais ser aceitas." : null}
								</p>
							</div>

							<div className="rounded-lg border bg-muted/20 p-4">
								<p className="font-medium text-sm">Estrutura</p>
								<p className="mt-1 text-sm text-muted-foreground">
									{isStructureLocked
										? "Já existem respostas registradas. Questões, tipos, obrigatoriedade, ordem e opções não podem mais ser alterados."
										: "Ainda não existem respostas registradas. Você pode adicionar, remover ou reordenar perguntas e opções."}
								</p>
							</div>

							<div className="flex flex-col gap-3">
								<Button type="button" onClick={handlePublish} disabled={isPending || !actionAvailability.canPublish || builderValue.questions.length === 0}>
									<Send className="size-4" />
									{currentStatus === "draft" ? "Publicar pesquisa" : "Publicação indisponível"}
								</Button>

								<Button type="button" variant="secondary" onClick={handleClose} disabled={isPending || !actionAvailability.canClose}>
									<SquareTerminal className="size-4" />
									{currentStatus === "published" ? "Encerrar pesquisa" : "Encerramento indisponível"}
								</Button>
							</div>

							<p className="text-sm text-muted-foreground">
								{currentStatus === "draft" && builderValue.questions.length === 0 ? "Adicione pelo menos uma pergunta antes de publicar." : null}
								{currentStatus === "draft" && builderValue.questions.length > 0 ? "Ao publicar, a pesquisa passa a respeitar as regras de disponibilidade e visibilidade já configuradas." : null}
								{currentStatus === "published" ? "Ao encerrar, a pesquisa muda para `closed` e deixa de aceitar novas respostas." : null}
								{currentStatus === "closed" ? "Pesquisas encerradas permanecem disponíveis apenas para revisão e resultados; a ação de publicar novamente não faz parte do fluxo atual." : null}
							</p>
						</CardContent>
					</Card>

					{isStructureLocked ? (
						<Card className="border-amber-500/30 bg-amber-500/5">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-base">
									<Lock className="size-4" />
									Histórico protegido
								</CardTitle>
								<CardDescription>Esse bloqueio vem do backend. Mesmo que alguém tente enviar uma alteração estrutural manualmente, a action retorna `survey_locked_after_response`.</CardDescription>
							</CardHeader>
						</Card>
					) : null}
				</div>
			</div>
		</div>
	)
}
