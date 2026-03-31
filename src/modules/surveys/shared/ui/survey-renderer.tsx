"use client"

import { useMemo, useState } from "react"
import type { SurveyAnswerInput, SurveyQuestionInput } from "@/modules/surveys/shared/types/survey-question.types"
import { validateSurveyAnswers } from "@/modules/surveys/shared/validations/survey-response.schema"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"

type SurveyRendererProps = {
	questions: SurveyQuestionInput[]
	onSubmit: (answers: SurveyAnswerInput[]) => Promise<void>
}

export const SurveyRenderer = ({ questions, onSubmit }: SurveyRendererProps) => {
	const [answers, setAnswers] = useState<Record<string, SurveyAnswerInput>>({})
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const normalizedQuestions = useMemo(
		() =>
			questions.map((question) => ({
				...question,
				id: question.id ?? `question-${question.position}`,
				options: question.options.map((option, optionIndex) => ({ ...option, id: option.id ?? `option-${question.position}-${optionIndex}` }))
			})),
		[questions]
	)

	const handleSubmit = async () => {
		const payload = Object.values(answers)
		const validation = validateSurveyAnswers({
			questions: normalizedQuestions,
			answers: payload
		})

		if (!validation.success) {
			setErrorMessage(validation.message)
			return
		}

		setErrorMessage(null)
		setIsSubmitting(true)
		try {
			await onSubmit(payload)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-4">
			{normalizedQuestions.map((question) => {
				const answer = answers[question.id] ?? { questionId: question.id }
				return (
					<div key={question.id} className="space-y-3 rounded-md border p-4">
						<div>
							<p className="font-medium">{question.title}</p>
							{question.description ? <p className="text-muted-foreground text-sm">{question.description}</p> : null}
						</div>

						{question.type === "single_choice" ? (
							<div className="space-y-2">
								{question.options.map((option) => (
									<button
										key={option.id}
										type="button"
										className="block w-full rounded-md border p-2 text-left"
										onClick={() => setAnswers((current) => ({ ...current, [question.id]: { questionId: question.id, answerOptionIds: [option.id ?? ""] } }))}
									>
										{option.label}
									</button>
								))}
							</div>
						) : null}

						{question.type === "textarea" ? (
							<Textarea
								value={answer.answerText ?? ""}
								maxLength={5000}
								placeholder="Escreva sua resposta"
								onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: { questionId: question.id, answerText: event.target.value } }))}
							/>
						) : null}

						{question.type === "checkbox" ? (
							<div className="space-y-2">
								{question.options.map((option) => {
									const checked = answer.answerOptionIds?.includes(option.id ?? "") ?? false
									return (
										<div key={option.id} className="flex items-center gap-2">
											<Checkbox
												checked={checked}
												onCheckedChange={(nextChecked) => {
													const current = answer.answerOptionIds ?? []
													const optionId = option.id ?? ""
													const next = nextChecked ? [...current, optionId] : current.filter((currentOptionId) => currentOptionId !== optionId)
													setAnswers((state) => ({ ...state, [question.id]: { questionId: question.id, answerOptionIds: next } }))
												}}
											/>
											<Label>{option.label}</Label>
										</div>
									)
								})}
							</div>
						) : null}

						{question.type === "ranking" ? (
							<div className="space-y-2">
								{question.options.map((option, optionIndex) => (
									<div key={option.id} className="grid grid-cols-[40px_1fr] items-center gap-2">
										<Input
											type="number"
											min={1}
											max={question.options.length}
											value={(answer.answerRanking ?? [])[optionIndex] ? (answer.answerRanking ?? []).indexOf(option.id ?? "") + 1 : ""}
											onChange={(event) => {
												const rank = Number(event.target.value)
												if (!Number.isFinite(rank) || rank < 1 || rank > question.options.length) {
													return
												}
												const optionId = option.id ?? ""
												const ranking = [...(answer.answerRanking ?? [])].filter((currentOptionId) => currentOptionId !== optionId)
												ranking.splice(rank - 1, 0, optionId)
												setAnswers((current) => ({ ...current, [question.id]: { questionId: question.id, answerRanking: ranking } }))
											}}
										/>
										<span>{option.label}</span>
									</div>
								))}
							</div>
						) : null}
					</div>
				)
			})}

			{errorMessage ? <p className="text-destructive text-sm">{errorMessage}</p> : null}

			<Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
				{isSubmitting ? "Enviando..." : "Enviar respostas"}
			</Button>
		</div>
	)
}
