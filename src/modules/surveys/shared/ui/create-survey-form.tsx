"use client"

import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { createSurveyAction } from "@/modules/surveys/server/slices/create-survey/actions/create-survey.action"
import { SurveyBuilder, type SurveyBuilderValue } from "@/modules/surveys/shared/ui/survey-builder"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"

type CreateSurveyFormProps = {
	organizationId: string
	organizationName: string
}

const DEFAULT_SURVEY_VALUE: SurveyBuilderValue = {
	title: "",
	description: null,
	visibility: "private",
	acceptAnonymousAnswers: false,
	startsAt: null,
	endsAt: null,
	questions: []
}

function normalizeNullableText(value: string | null) {
	if (!value) {
		return null
	}

	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
}

export const CreateSurveyForm = ({ organizationId, organizationName }: CreateSurveyFormProps) => {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [builderValue, setBuilderValue] = useState<SurveyBuilderValue>(DEFAULT_SURVEY_VALUE)
	const [serverMessage, setServerMessage] = useState<string | null>(null)

	const handleReset = () => {
		setServerMessage(null)
		setBuilderValue(DEFAULT_SURVEY_VALUE)
	}

	const handleSubmit = () => {
		setServerMessage(null)

		startTransition(async () => {
			try {
				const result = await createSurveyAction({
					organizationId,
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
					switch (result.code) {
						case "unauthenticated": {
							router.replace("/")
							return
						}

						case "organization_not_found": {
							router.replace("/tenant-not-found")
							return
						}

						case "not_allowed": {
							router.replace("/dashboard/surveys")
							return
						}

						default: {
							setServerMessage(result.message)
							toast.error("Não foi possível criar a pesquisa", {
								description: result.message
							})
							return
						}
					}
				}

				toast.success("Rascunho criado com sucesso", {
					description: result.message
				})
				router.push("/dashboard/surveys")
				router.refresh()
			} catch (error) {
				const message = error instanceof Error ? error.message : "Tente novamente em alguns instantes."
				setServerMessage(message)
				toast.error("Erro inesperado ao criar a pesquisa", {
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
						<Badge variant="outline">Nova pesquisa</Badge>
						<Badge variant="secondary">Salva como rascunho</Badge>
					</div>
					<h1 className="text-3xl font-semibold tracking-tight">Criar pesquisa da organização</h1>
					<p className="max-w-3xl text-sm text-muted-foreground">Monte um rascunho para {organizationName} com título, janela de disponibilidade, visibilidade e estrutura completa de perguntas antes da publicação.</p>
				</div>
			</header>

			<Card>
				<CardHeader>
					<CardTitle>Configuração da pesquisa</CardTitle>
					<CardDescription>O rascunho pode ser criado sem publicar. Depois você poderá revisar o conteúdo e ajustar o fluxo de respostas no dashboard.</CardDescription>
				</CardHeader>
				<CardContent>
					<SurveyBuilder value={builderValue} onChange={setBuilderValue} />

					{serverMessage ? <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{serverMessage}</div> : null}
				</CardContent>
				<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" onClick={handleReset} disabled={isPending}>
						Limpar rascunho
					</Button>
					<Button type="button" onClick={handleSubmit} disabled={isPending}>
						<Save className="size-4" />
						{isPending ? "Salvando rascunho..." : "Salvar rascunho"}
					</Button>
				</CardFooter>
			</Card>
		</div>
	)
}
