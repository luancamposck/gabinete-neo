// src/app/(dashboard)/tasks/components/create-organization-task-form.tsx

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createOrganizationTaskAction } from "@/actions/organization-tasks/create-organization-task.action"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { type CreateOrganizationTaskSchemaClientData, createOrganizationTaskBaseSchemaClient } from "@/lib/validations/organization-tasks-schemas/create-organization-task-schema.client"

export const CreateOrganizationTaskForm = () => {
	const form = useForm<CreateOrganizationTaskSchemaClientData>({
		resolver: zodResolver(createOrganizationTaskBaseSchemaClient),
		defaultValues: {
			title: "",
			description: "",
			dueDate: undefined
		}
	})

	const { handleSubmit, control, reset, formState } = form

	async function onSubmit(values: CreateOrganizationTaskSchemaClientData) {
		try {
			const result = await createOrganizationTaskAction(values)

			if (!result) {
				toast.error("Erro ao criar tarefa", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (!result.success) {
				toast.error("Erro ao criar tarefa", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
				return
			}

			toast.success("Tarefa criada!", {
				description: result.message
			})

			reset()
		} catch (error) {
			console.error("[CreateOrganizationTaskForm] erro inesperado:", error)

			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<Card className="w-full max-w-xl ">
			<CardHeader>
				<CardTitle>Criar nova tarefa</CardTitle>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Título</FormLabel>
									<FormControl>
										<Input placeholder="Ex: Revisar discurso de sexta" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="description"
							render={({ field }) => {
								const { value, ...restField } = field

								return (
									<FormItem>
										<FormLabel>Descrição (opcional)</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Adicione detalhes importantes, contexto, links, etc."
												className="min-h-[120px]"
												{...restField}
												value={value ?? ""} // 👈 nunca passa null pro Textarea
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)
							}}
						/>

						<FormField
							control={control}
							name="dueDate"
							render={({ field }) => (
								<FormItem className="flex flex-col gap-2">
									<FormLabel>Prazo (opcional)</FormLabel>
									<div className="flex flex-wrap items-center gap-2">
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{field.value ? field.value.toLocaleDateString("pt-BR") : <span>Selecione uma data</span>}
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value ?? undefined}
													onSelect={field.onChange}
													initialFocus
													disabled={(date) => {
														const today = new Date()
														today.setHours(0, 0, 0, 0)
														const candidate = new Date(date)
														candidate.setHours(0, 0, 0, 0)
														return candidate < today
													}}
												/>
											</PopoverContent>
										</Popover>

										<Button type="button" variant="ghost" size="sm" onClick={() => field.onChange(undefined)} disabled={!field.value}>
											Limpar data
										</Button>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end pt-2">
							<Button type="submit" disabled={formState.isSubmitting}>
								{formState.isSubmitting ? "Criando..." : "Criar tarefa"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
