"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useId } from "react"
import type { SurveyQuestionInput, SurveyQuestionType } from "@/modules/surveys/shared/types/survey-question.types"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

type SurveyBuilderProps = {
	questions: SurveyQuestionInput[]
	visibility: "public" | "private"
	acceptAnonymousAnswers: boolean
	onVisibilityChange: (value: "public" | "private") => void
	onAcceptAnonymousAnswersChange: (value: boolean) => void
	onQuestionsChange: (next: SurveyQuestionInput[]) => void
}

const QUESTION_TYPES: SurveyQuestionType[] = ["single_choice", "textarea", "checkbox", "ranking"]
const getBaseOnePosition = (index: number) => index + 1
const normalizeOptionPositions = (options: SurveyQuestionInput["options"]) => options.map((option, optionIndex) => ({ ...option, position: getBaseOnePosition(optionIndex) }))
const normalizeQuestionPositions = (questions: SurveyQuestionInput[]) =>
	questions.map((question, questionIndex) => ({
		...question,
		position: getBaseOnePosition(questionIndex),
		options: normalizeOptionPositions(question.options)
	}))

export const SurveyBuilder = ({ questions, visibility, acceptAnonymousAnswers, onVisibilityChange, onAcceptAnonymousAnswersChange, onQuestionsChange }: SurveyBuilderProps) => {
	const acceptAnonymousId = useId()
	const addQuestion = () => {
		onQuestionsChange([
			...questions,
			{
				id: crypto.randomUUID(),
				title: "",
				description: "",
				type: "single_choice",
				required: false,
				position: getBaseOnePosition(questions.length),
				options: [
					{ id: crypto.randomUUID(), label: "Opção 1", value: "opcao_1", position: 1 },
					{ id: crypto.randomUUID(), label: "Opção 2", value: "opcao_2", position: 2 }
				]
			}
		])
	}

	const updateQuestion = (index: number, next: Partial<SurveyQuestionInput>) => {
		onQuestionsChange(questions.map((question, questionIndex) => (questionIndex === index ? { ...question, ...next } : question)))
	}

	const removeQuestion = (index: number) => {
		onQuestionsChange(normalizeQuestionPositions(questions.filter((_, questionIndex) => questionIndex !== index)))
	}

	const moveQuestion = (index: number, direction: -1 | 1) => {
		const targetIndex = index + direction
		if (targetIndex < 0 || targetIndex >= questions.length) {
			return
		}

		const next = [...questions]
		const current = next[index]
		next[index] = next[targetIndex]
		next[targetIndex] = current

		onQuestionsChange(normalizeQuestionPositions(next))
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Visibilidade</Label>
					<Select value={visibility} onValueChange={(value: "public" | "private") => onVisibilityChange(value)}>
						<SelectTrigger>
							<SelectValue placeholder="Escolha" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="public">public</SelectItem>
							<SelectItem value="private">private</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-end gap-2">
					<Checkbox id={acceptAnonymousId} checked={acceptAnonymousAnswers} onCheckedChange={(checked) => onAcceptAnonymousAnswersChange(Boolean(checked))} />
					<Label htmlFor={acceptAnonymousId}>Permitir respostas anônimas</Label>
				</div>
			</div>

			{questions.map((question, questionIndex) => {
				const hasAlternatives = question.type === "single_choice" || question.type === "checkbox" || question.type === "ranking"
				return (
					<div key={question.id ?? `question-${question.position}-${question.title}`} className="space-y-3 rounded-md border p-4">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm font-semibold">Questão {questionIndex + 1}</span>
							<Button type="button" size="icon" variant="ghost" onClick={() => moveQuestion(questionIndex, -1)}>
								<ArrowUp className="size-4" />
							</Button>
							<Button type="button" size="icon" variant="ghost" onClick={() => moveQuestion(questionIndex, 1)}>
								<ArrowDown className="size-4" />
							</Button>
							<Button type="button" size="icon" variant="ghost" onClick={() => removeQuestion(questionIndex)}>
								<Trash2 className="size-4" />
							</Button>
						</div>

						<Input value={question.title} placeholder="Título da questão" onChange={(event) => updateQuestion(questionIndex, { title: event.target.value })} />
						<Textarea value={question.description ?? ""} placeholder="Descrição (opcional)" onChange={(event) => updateQuestion(questionIndex, { description: event.target.value })} />

						<div className="grid gap-2 sm:grid-cols-2">
							<Select value={question.type} onValueChange={(value: SurveyQuestionType) => updateQuestion(questionIndex, { type: value, options: value === "textarea" ? [] : question.options })}>
								<SelectTrigger>
									<SelectValue placeholder="Tipo" />
								</SelectTrigger>
								<SelectContent>
									{QUESTION_TYPES.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<div className="flex items-center gap-2">
								<Checkbox id={`required-${questionIndex}`} checked={question.required} onCheckedChange={(checked) => updateQuestion(questionIndex, { required: Boolean(checked) })} />
								<Label htmlFor={`required-${questionIndex}`}>Obrigatória</Label>
							</div>
						</div>

						{hasAlternatives ? (
							<div className="space-y-2">
								{question.options.map((option, optionIndex) => (
									<div key={option.id ?? `${option.value}-${option.position}`} className="flex gap-2">
										<Input
											value={option.label}
											placeholder={`Opção ${optionIndex + 1}`}
											onChange={(event) => {
												const nextOptions = question.options.map((current, currentIndex) =>
													currentIndex === optionIndex ? { ...current, label: event.target.value, value: event.target.value.trim().toLowerCase().replace(/\s+/g, "_") } : current
												)
												updateQuestion(questionIndex, { options: nextOptions })
											}}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => updateQuestion(questionIndex, { options: normalizeOptionPositions(question.options.filter((_, currentIndex) => currentIndex !== optionIndex)) })}
										>
											<Trash2 className="size-4" />
										</Button>
									</div>
								))}
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										updateQuestion(questionIndex, {
											options: normalizeOptionPositions([
												...question.options,
												{ id: crypto.randomUUID(), label: `Opção ${question.options.length + 1}`, value: `opcao_${question.options.length + 1}`, position: getBaseOnePosition(question.options.length) }
											])
										})
									}
								>
									<Plus className="mr-2 size-4" /> Adicionar opção
								</Button>
							</div>
						) : null}
					</div>
				)
			})}

			<Button type="button" variant="secondary" onClick={addQuestion}>
				<Plus className="mr-2 size-4" /> Adicionar questão
			</Button>
		</div>
	)
}
