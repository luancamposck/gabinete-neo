"use client"

import { ArrowDown, ArrowUp, Lock, Plus, Trash2 } from "lucide-react"
import { useId } from "react"
import type { SurveyQuestionInput, SurveyQuestionOptionInput, SurveyQuestionType } from "@/modules/surveys/shared/types/survey-question.types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

export type SurveyBuilderValue = {
	title: string
	description: string | null
	visibility: "public" | "private"
	acceptAnonymousAnswers: boolean
	startsAt: string | null
	endsAt: string | null
	questions: SurveyQuestionInput[]
}

type SurveyBuilderProps = {
	value: SurveyBuilderValue
	onChange: (next: SurveyBuilderValue) => void
	isStructureLocked?: boolean
}

const QUESTION_TYPES: SurveyQuestionType[] = ["single_choice", "textarea", "checkbox", "ranking"]

function getBaseOnePosition(index: number) {
	return index + 1
}

function normalizeOptionLabelToValue(label: string) {
	const normalized = label
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")

	return normalized
}

function createDefaultOption(index: number): SurveyQuestionOptionInput {
	const position = getBaseOnePosition(index)
	return {
		id: crypto.randomUUID(),
		label: `Opção ${position}`,
		value: `opcao_${position}`,
		position
	}
}

function createDefaultQuestion(index: number): SurveyQuestionInput {
	return {
		id: crypto.randomUUID(),
		title: "",
		description: "",
		type: "single_choice",
		required: false,
		position: getBaseOnePosition(index),
		options: [createDefaultOption(0), createDefaultOption(1)]
	}
}

function normalizeOptionPositions(options: SurveyQuestionOptionInput[]) {
	return options.map((option, optionIndex) => ({
		...option,
		position: getBaseOnePosition(optionIndex)
	}))
}

function normalizeQuestionOptions(question: SurveyQuestionInput) {
	if (question.type === "textarea") {
		return []
	}

	return normalizeOptionPositions(question.options)
}

function normalizeQuestionPositions(questions: SurveyQuestionInput[]) {
	return questions.map((question, questionIndex) => ({
		...question,
		position: getBaseOnePosition(questionIndex),
		options: normalizeQuestionOptions(question)
	}))
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
	const targetIndex = index + direction
	if (targetIndex < 0 || targetIndex >= items.length) {
		return items
	}

	const next = [...items]
	const current = next[index]
	next[index] = next[targetIndex]
	next[targetIndex] = current
	return next
}

function formatIsoStringToDateTimeLocalValue(value: string | null) {
	if (!value) {
		return ""
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return ""
	}

	const offsetMs = date.getTimezoneOffset() * 60_000
	return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function parseDateTimeLocalValue(value: string) {
	if (value.trim().length === 0) {
		return null
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return null
	}

	return date.toISOString()
}

export const SurveyBuilder = ({ value, onChange, isStructureLocked = false }: SurveyBuilderProps) => {
	const titleId = useId()
	const descriptionId = useId()
	const visibilityId = useId()
	const acceptAnonymousId = useId()
	const startsAtId = useId()
	const endsAtId = useId()

	const setValue = (next: Partial<SurveyBuilderValue>) => {
		onChange({
			...value,
			...next
		})
	}

	const setQuestions = (nextQuestions: SurveyQuestionInput[]) => {
		setValue({
			questions: normalizeQuestionPositions(nextQuestions)
		})
	}

	const addQuestion = () => {
		setQuestions([...value.questions, createDefaultQuestion(value.questions.length)])
	}

	const updateQuestion = (index: number, next: Partial<SurveyQuestionInput>) => {
		setQuestions(value.questions.map((question, questionIndex) => (questionIndex === index ? { ...question, ...next } : question)))
	}

	const removeQuestion = (index: number) => {
		setQuestions(value.questions.filter((_, questionIndex) => questionIndex !== index))
	}

	const moveQuestion = (index: number, direction: -1 | 1) => {
		setQuestions(moveItem(value.questions, index, direction))
	}

	const updateQuestionOptions = (questionIndex: number, nextOptions: SurveyQuestionOptionInput[]) => {
		updateQuestion(questionIndex, {
			options: normalizeOptionPositions(nextOptions)
		})
	}

	const addOption = (questionIndex: number) => {
		const question = value.questions[questionIndex]
		updateQuestionOptions(questionIndex, [...question.options, createDefaultOption(question.options.length)])
	}

	const removeOption = (questionIndex: number, optionIndex: number) => {
		const question = value.questions[questionIndex]
		updateQuestionOptions(
			questionIndex,
			question.options.filter((_, currentIndex) => currentIndex !== optionIndex)
		)
	}

	const moveOption = (questionIndex: number, optionIndex: number, direction: -1 | 1) => {
		const question = value.questions[questionIndex]
		updateQuestionOptions(questionIndex, moveItem(question.options, optionIndex, direction))
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 rounded-md border p-4">
				<div className="space-y-2">
					<Label htmlFor={titleId}>Título</Label>
					<Input id={titleId} value={value.title} placeholder="Ex.: Pesquisa de satisfação do onboarding" onChange={(event) => setValue({ title: event.target.value })} />
				</div>

				<div className="space-y-2">
					<Label htmlFor={descriptionId}>Descrição</Label>
					<Textarea id={descriptionId} value={value.description ?? ""} placeholder="Contexto opcional para quem vai responder." onChange={(event) => setValue({ description: event.target.value })} />
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor={visibilityId}>Visibilidade</Label>
						<Select value={value.visibility} onValueChange={(nextVisibility: "public" | "private") => setValue({ visibility: nextVisibility })}>
							<SelectTrigger id={visibilityId}>
								<SelectValue placeholder="Escolha a visibilidade" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="public">Pública</SelectItem>
								<SelectItem value="private">Privada</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor={startsAtId}>Início da disponibilidade</Label>
						<Input id={startsAtId} type="datetime-local" value={formatIsoStringToDateTimeLocalValue(value.startsAt)} onChange={(event) => setValue({ startsAt: parseDateTimeLocalValue(event.target.value) })} />
					</div>

					<div className="space-y-2">
						<Label htmlFor={endsAtId}>Fim da disponibilidade</Label>
						<Input id={endsAtId} type="datetime-local" value={formatIsoStringToDateTimeLocalValue(value.endsAt)} onChange={(event) => setValue({ endsAt: parseDateTimeLocalValue(event.target.value) })} />
					</div>

					<div className="flex min-h-11 items-end gap-2 rounded-md border px-3 py-2">
						<Checkbox id={acceptAnonymousId} checked={value.acceptAnonymousAnswers} onCheckedChange={(checked) => setValue({ acceptAnonymousAnswers: Boolean(checked) })} />
						<div className="space-y-1">
							<Label htmlFor={acceptAnonymousId}>Permitir respostas anônimas</Label>
							<p className="text-muted-foreground text-sm">Quando desabilitado, respostas públicas exigem identificação do respondente.</p>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4 rounded-md border p-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h2 className="font-semibold text-lg">Perguntas</h2>
							<Badge variant={isStructureLocked ? "secondary" : "outline"}>{isStructureLocked ? "Estrutura travada" : "Estrutura editável"}</Badge>
						</div>
						<p className="text-muted-foreground text-sm">
							{isStructureLocked
								? "Esta pesquisa já possui respostas. A estrutura das perguntas e opções está bloqueada para preservar o histórico."
								: "Adicione, remova e reordene perguntas e opções. As posições são sempre normalizadas em base 1."}
						</p>
					</div>

					<Button type="button" variant="secondary" onClick={addQuestion} disabled={isStructureLocked}>
						<Plus className="mr-2 size-4" /> Adicionar questão
					</Button>
				</div>

				{value.questions.length === 0 ? <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground text-sm">Nenhuma questão adicionada ainda.</div> : null}

				{value.questions.map((question, questionIndex) => {
					const hasAlternatives = question.type === "single_choice" || question.type === "checkbox" || question.type === "ranking"

					return (
						<div key={question.id ?? `question-${question.position}-${question.title}`} className="space-y-4 rounded-md border p-4">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-semibold text-sm">Questão {question.position}</span>
								{isStructureLocked ? <Lock className="text-muted-foreground size-4" /> : null}
								<Button type="button" size="icon" variant="ghost" onClick={() => moveQuestion(questionIndex, -1)} disabled={isStructureLocked || questionIndex === 0}>
									<ArrowUp className="size-4" />
								</Button>
								<Button type="button" size="icon" variant="ghost" onClick={() => moveQuestion(questionIndex, 1)} disabled={isStructureLocked || questionIndex === value.questions.length - 1}>
									<ArrowDown className="size-4" />
								</Button>
								<Button type="button" size="icon" variant="ghost" onClick={() => removeQuestion(questionIndex)} disabled={isStructureLocked}>
									<Trash2 className="size-4" />
								</Button>
							</div>

							<div className="space-y-2">
								<Label htmlFor={`question-title-${question.id}`}>Título da questão</Label>
								<Input
									id={`question-title-${question.id}`}
									value={question.title}
									placeholder="Título da questão"
									onChange={(event) => updateQuestion(questionIndex, { title: event.target.value })}
									disabled={isStructureLocked}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor={`question-description-${question.id}`}>Descrição da questão</Label>
								<Textarea
									id={`question-description-${question.id}`}
									value={question.description ?? ""}
									placeholder="Descrição opcional"
									onChange={(event) => updateQuestion(questionIndex, { description: event.target.value })}
									disabled={isStructureLocked}
								/>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor={`question-type-${question.id}`}>Tipo de resposta</Label>
									<Select
										value={question.type}
										onValueChange={(nextType: SurveyQuestionType) =>
											updateQuestion(questionIndex, {
												type: nextType,
												options: nextType === "textarea" ? [] : question.options.length > 0 ? question.options : [createDefaultOption(0), createDefaultOption(1)]
											})
										}
										disabled={isStructureLocked}
									>
										<SelectTrigger id={`question-type-${question.id}`}>
											<SelectValue placeholder="Selecione o tipo" />
										</SelectTrigger>
										<SelectContent>
											{QUESTION_TYPES.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex min-h-11 items-end gap-2 rounded-md border px-3 py-2">
									<Checkbox id={`required-${question.id}`} checked={question.required} onCheckedChange={(checked) => updateQuestion(questionIndex, { required: Boolean(checked) })} disabled={isStructureLocked} />
									<Label htmlFor={`required-${question.id}`}>Resposta obrigatória</Label>
								</div>
							</div>

							{hasAlternatives ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between gap-2">
										<h3 className="font-medium text-sm">Opções</h3>
										<Button type="button" variant="outline" onClick={() => addOption(questionIndex)} disabled={isStructureLocked}>
											<Plus className="mr-2 size-4" /> Adicionar opção
										</Button>
									</div>

									{question.options.map((option, optionIndex) => (
										<div key={option.id ?? `${option.value}-${option.position}`} className="flex items-center gap-2">
											<div className="min-w-10 text-muted-foreground text-sm">{option.position}.</div>
											<Input
												value={option.label}
												placeholder={`Opção ${option.position}`}
												onChange={(event) => {
													const nextLabel = event.target.value
													const nextOptions = question.options.map((current, currentIndex) => (currentIndex === optionIndex ? { ...current, label: nextLabel, value: normalizeOptionLabelToValue(nextLabel) } : current))
													updateQuestionOptions(questionIndex, nextOptions)
												}}
												disabled={isStructureLocked}
											/>
											<Button type="button" size="icon" variant="ghost" onClick={() => moveOption(questionIndex, optionIndex, -1)} disabled={isStructureLocked || optionIndex === 0}>
												<ArrowUp className="size-4" />
											</Button>
											<Button type="button" size="icon" variant="ghost" onClick={() => moveOption(questionIndex, optionIndex, 1)} disabled={isStructureLocked || optionIndex === question.options.length - 1}>
												<ArrowDown className="size-4" />
											</Button>
											<Button type="button" variant="ghost" size="icon" onClick={() => removeOption(questionIndex, optionIndex)} disabled={isStructureLocked}>
												<Trash2 className="size-4" />
											</Button>
										</div>
									))}
								</div>
							) : null}
						</div>
					)
				})}
			</div>
		</div>
	)
}
