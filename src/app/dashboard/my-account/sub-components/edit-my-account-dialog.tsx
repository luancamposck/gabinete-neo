"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Save, UserRoundPen } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FocusEvent, type ReactNode, useEffect, useMemo, useState, useTransition } from "react"
import { type FieldPath, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brazilianStates } from "@/lib/constants/brazilian-states"
import { maskCep, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { formatCep, formatPhone } from "@/lib/utils/formatters"
import { type EditUserWithProfileBaseSchemaClientData, editUserWithProfileBaseSchemaClient } from "@/lib/validations/use-cases/edit-user-with-profile-schemas/edit-user-with-profile-schemas.client"
import { updateMyAccountAction } from "../sub-actions/update-my-account.action"

interface EditMyAccountDialogProps {
	userId: string
	defaultValues: EditUserWithProfileBaseSchemaClientData
	trigger?: ReactNode
}

const formatDefaultValues = (values: EditUserWithProfileBaseSchemaClientData): EditUserWithProfileBaseSchemaClientData => ({
	...values,
	phone: formatPhone(values.phone ?? ""),
	adress: {
		...values.adress,
		cep: formatCep(values.adress.cep ?? "")
	}
})

export const EditMyAccountDialog = ({ userId, defaultValues, trigger }: EditMyAccountDialogProps) => {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState(1)
	const [isFetchingCep, setIsFetchingCep] = useState(false)
	const [isPending, startTransition] = useTransition()
	const router = useRouter()

	const formattedDefaultValues = useMemo(() => formatDefaultValues(defaultValues), [defaultValues])

	const form = useForm<EditUserWithProfileBaseSchemaClientData>({
		resolver: zodResolver(editUserWithProfileBaseSchemaClient),
		defaultValues: formattedDefaultValues
	})

	const { control, handleSubmit, setValue, setFocus, resetField, reset, trigger: triggerValidation } = form

	useEffect(() => {
		if (!open) {
			reset(formattedDefaultValues)
			setStep(1)
		}
	}, [formattedDefaultValues, open, reset])

	const handleDialogOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen)
		if (nextOpen) {
			reset(formattedDefaultValues)
			setStep(1)
		}
	}

	async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
		const cep = event.target.value.replace(/\D/g, "")

		if (cep.length !== 8) {
			return
		}

		setIsFetchingCep(true)

		try {
			const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
			const data = await response.json()

			if (data.erro) {
				toast.error("CEP nao encontrado", {
					description: "Revise o CEP informado."
				})
				resetField("adress.street")
				resetField("adress.neighborhood")
				resetField("adress.city")
				resetField("adress.state")
				return
			}

			setValue("adress.street", data.logradouro ?? "", { shouldValidate: true })
			setValue("adress.neighborhood", data.bairro ?? "", { shouldValidate: true })
			setValue("adress.city", data.localidade ?? "", { shouldValidate: true })
			setValue("adress.state", data.uf ?? "", { shouldValidate: true })
			setFocus("adress.number")
		} catch (error) {
			console.error("[EditMyAccountDialog] erro ao buscar CEP:", error)
			toast.error("Erro ao buscar CEP", {
				description: "Tente novamente em instantes."
			})
		} finally {
			setIsFetchingCep(false)
		}
	}

	const goToPrevStep = () => setStep((prev) => Math.max(1, prev - 1))

	async function goToNextStep(currentStep: number) {
		let fieldsToValidate: FieldPath<EditUserWithProfileBaseSchemaClientData>[] = []

		if (currentStep === 1) {
			fieldsToValidate = ["name", "phone"]
		} else if (currentStep === 2) {
			fieldsToValidate = ["adress.cep", "adress.street", "adress.number", "adress.neighborhood", "adress.city", "adress.state"]
		}

		const output = await triggerValidation(fieldsToValidate, { shouldFocus: true })
		if (output) {
			setStep((prev) => prev + 1)
		}
	}

	function onSubmit(data: EditUserWithProfileBaseSchemaClientData) {
		startTransition(async () => {
			const result = await updateMyAccountAction(data, userId)

			if (!result) {
				toast.error("Erro ao atualizar dados", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success) {
				toast.success("Dados atualizados", {
					description: result.message
				})
				reset(data)
				setStep(1)
				setOpen(false)
				router.refresh()
			} else {
				toast.error("Erro ao atualizar dados", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
			}
		})
	}

	return (
		<Dialog open={open} onOpenChange={handleDialogOpenChange}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="outline" size="lg" className="gap-2 w-full md:w-auto">
						<UserRoundPen className="h-4 w-4" />
						Editar dados
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="md:max-w-2xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Atualizar meus dados</DialogTitle>
					<DialogDescription>Revise e confirme as informacoes antes de salvar.</DialogDescription>
				</DialogHeader>

				<div className="flex w-full items-start pt-2">
					<div className="flex flex-1 flex-col items-center">
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 1 ? "text-primary" : "text-muted-foreground")}>Dados pessoais</p>
					</div>
					<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", step > 1 && "bg-primary")} />
					<div className="flex flex-1 flex-col items-center">
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 2 ? "text-primary" : "text-muted-foreground")}>Endereco</p>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
						{step === 1 && (
							<div className="space-y-4">
								<FormField
									control={control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nome completo</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Digite o nome" disabled={isPending} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Celular</FormLabel>
											<FormControl>
												<Input {...field} placeholder="(00) 00000-0000" onChange={(event) => field.onChange(maskPhone(event.target.value))} disabled={isPending} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<FormField
										control={control}
										name="adress.cep"
										render={({ field }) => (
											<FormItem className="md:col-span-1">
												<FormLabel>CEP</FormLabel>
												<FormControl>
													<Input {...field} placeholder="00000-000" onChange={(event) => field.onChange(maskCep(event.target.value))} onBlur={handleCepBlur} disabled={isPending} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="adress.street"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Rua</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Rua Exemplo" disabled={isPending || isFetchingCep} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<FormField
										control={control}
										name="adress.number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Numero</FormLabel>
												<FormControl>
													<Input {...field} placeholder="123" disabled={isPending} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="adress.complement"
										render={({ field }) => (
											<FormItem className="md:col-span-2">
												<FormLabel>Complemento (opcional)</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Apto 101, bloco B" disabled={isPending} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<FormField
										control={control}
										name="adress.neighborhood"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Bairro</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Bairro" disabled={isPending || isFetchingCep} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="adress.city"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Cidade</FormLabel>
												<FormControl>
													<Input {...field} placeholder="Cidade" disabled={isPending || isFetchingCep} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="adress.state"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Estado</FormLabel>
												<Select onValueChange={field.onChange} value={field.value} disabled={isPending || isFetchingCep}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Estado" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{brazilianStates.map((state) => (
															<SelectItem key={state.value} value={state.value}>
																{state.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						)}

						<DialogFooter className="pt-2">
							{step > 1 && (
								<Button type="button" variant="outline" onClick={goToPrevStep} disabled={isPending || isFetchingCep}>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Voltar
								</Button>
							)}

							{step < 2 && (
								<Button type="button" onClick={() => goToNextStep(step)} disabled={isPending}>
									Proximo
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							)}

							{step === 2 && (
								<Button type="submit" disabled={isPending}>
									<Save className="mr-2 h-4 w-4" />
									Salvar
								</Button>
							)}
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
