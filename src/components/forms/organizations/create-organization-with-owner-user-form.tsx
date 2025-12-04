"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react"
import { useState } from "react"
import { type FieldPath, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createOrganizationWithOwnerAction } from "@/actions/create-organization-with-owner-user.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brazilianStates } from "@/lib/constants/brazilian-states"
import { maskCep, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { slugify } from "@/lib/utils/slugify-utils"
import { type CreateOrganizationWithOwnerSchemaClientData, createOrganizationWithOwnerSchemaClient } from "@/lib/validations/use-cases/create-organization-with-owner-schemas/create-organization-with-owner-schema.client"

export const CreateOrganizationWithOwnerUserForm = () => {
	const [step, setStep] = useState<number>(1)
	const [isFetchingUserCep, setIsFetchingUserCep] = useState<boolean>(false)

	const createOrganizationWithOwnerUserForm = useForm<CreateOrganizationWithOwnerSchemaClientData>({
		resolver: zodResolver(createOrganizationWithOwnerSchemaClient),
		defaultValues: {
			user: {
				name: "",
				phone: "",
				email: "",
				confirmEmail: "",
				password: "",
				confirmPassword: "",
				adress: {
					cep: "",
					street: "",
					number: "",
					neighborhood: "",
					city: "",
					state: "",
					complement: ""
				}
			},
			organization: {
				name: "",
				slug: ""
			}
		}
	})

	const { control, handleSubmit, formState, setValue, setFocus, trigger, resetField, reset } = createOrganizationWithOwnerUserForm

	async function handleUserCepBlur(e: React.FocusEvent<HTMLInputElement>) {
		const cep = e.target.value.replace(/\D/g, "")

		if (cep.length !== 8) {
			return
		}

		setIsFetchingUserCep(true)
		try {
			const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
			const data = await response.json()
			if (data.erro) {
				toast.error("CEP não encontrado", {
					description: "Por favor, verifique o CEP digitado."
				})
				resetField("user.adress.street")
				resetField("user.adress.neighborhood")
				resetField("user.adress.city")
				resetField("user.adress.state")
				return
			}
			setValue("user.adress.street", data.logradouro, { shouldValidate: true })
			setValue("user.adress.neighborhood", data.bairro, { shouldValidate: true })
			setValue("user.adress.city", data.localidade, { shouldValidate: true })
			setValue("user.adress.state", data.uf, { shouldValidate: true })
			setFocus("user.adress.number")
		} catch (error) {
			console.error("Falha ao buscar CEP:", error)
			toast.error("Erro ao buscar CEP", {
				description: "Não foi possível buscar os dados do endereço. Tente novamente."
			})
		} finally {
			setIsFetchingUserCep(false)
		}
	}

	const prevStep = () => setStep((prev) => prev - 1)

	async function nextStep(currentStep: number) {
		let fieldsToValidate: FieldPath<CreateOrganizationWithOwnerSchemaClientData>[] = []

		if (currentStep === 1) {
			fieldsToValidate = ["user.name", "user.phone", "user.email", "user.confirmEmail", "user.password", "user.confirmPassword"]
		} else if (currentStep === 2) {
			fieldsToValidate = ["user.adress.cep", "user.adress.street", "user.adress.number", "user.adress.neighborhood", "user.adress.city", "user.adress.state"]
		} else if (currentStep === 3) {
			fieldsToValidate = ["organization.name", "organization.slug"]
		}

		const output = await trigger(fieldsToValidate, { shouldFocus: true })
		if (output) {
			setStep(currentStep + 1)
		}
	}

	async function onSubmit(data: CreateOrganizationWithOwnerSchemaClientData) {
		try {
			const result = await createOrganizationWithOwnerAction(data)

			if (!result) {
				toast.error("Erro no cadastro", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success) {
				toast.success("Cadastro realizado com sucesso!", {
					description: result.message
				})

				reset()
				setStep(1)
			} else {
				toast.error("Erro no cadastro", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
			}
		} catch (error) {
			console.error("[createOrganizationWithOwnerAction] erro inesperado:", error)

			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	// function onSubmit(data: CreatePartnerWithOwnerClientData) {
	// 	toast.promise(createPartnerWithOwnerUserAction(data), {
	// 		loading: "Enviando cadastro...",
	// 		success: (result) => {
	// 			if (result.success) {
	// 				queryClient.invalidateQueries({ queryKey: ["partners"] })
	// 				reset()
	// 				setStep(1)
	// 				return "Cadastro realizado com sucesso! Seu cadastro foi enviado para análise."
	// 			}
	// 			console.log(result)
	// 			throw new Error(result.message)
	// 		},
	// 		error: (err: Error) => {
	// 			return err.message
	// 		}
	// 	})
	// }

	return (
		<Card className={cn("w-full border-0 shadow-none")}>
			<CardHeader>
				<div className="flex w-full items-start pt-6">
					{" "}
					<div className="flex flex-1 flex-col items-center">
						{" "}
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</div>{" "}
						<p className={cn("mt-2 text-sm font-medium", step >= 1 ? "text-primary" : "text-muted-foreground")}>Usuário</p>{" "}
					</div>{" "}
					<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", step > 1 && "bg-primary")} />{" "}
					<div className="flex flex-1 flex-col items-center">
						{" "}
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>{" "}
						<p className={cn("mt-2 text-sm font-medium", step >= 2 ? "text-primary" : "text-muted-foreground")}>Endereço</p>{" "}
					</div>{" "}
					<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", step > 2 && "bg-primary")} />{" "}
					<div className="flex flex-1 flex-col items-center">
						{" "}
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</div>{" "}
						<p className={cn("mt-2 text-sm font-medium", step >= 3 ? "text-primary" : "text-muted-foreground")}>Organização</p>{" "}
					</div>{" "}
				</div>
			</CardHeader>

			<CardContent>
				<Form {...createOrganizationWithOwnerUserForm}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div>
							{/* Step 1 - Dados do usuário */}
							{step === 1 && (
								<div className="space-y-6">
									<FormField
										control={control}
										name="user.name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nome do Usuário</FormLabel>
												<FormControl>
													<Input placeholder="João da Silva" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="user.phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Celular</FormLabel>
												<FormControl>
													<Input placeholder="(11) 99999-9999" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="user.email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email do usuário</FormLabel>
												<FormControl>
													<Input type="email" placeholder="seu-email@suaempresa.com" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="user.confirmEmail"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirmar Email do Usuário</FormLabel>
												<FormControl>
													<Input type="email" placeholder="confirme.contato@suaempresa.com" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="user.password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Senha</FormLabel>
												<FormControl>
													<Input type="password" placeholder="********" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="user.confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Confirmar Senha</FormLabel>
												<FormControl>
													<Input type="password" placeholder="********" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}

							{/* Step 2 - Endereço do usuário */}
							{step === 2 && (
								<div className="space-y-6">
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="user.adress.cep"
											render={({ field }) => (
												<FormItem className="md:col-span-1">
													<FormLabel>CEP</FormLabel>
													<FormControl>
														<Input placeholder="00000-000" {...field} onChange={(e) => field.onChange(maskCep(e.target.value))} onBlur={handleUserCepBlur} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="user.adress.street"
											render={({ field }) => (
												<FormItem className="md:col-span-2">
													<FormLabel>Rua</FormLabel>
													<FormControl>
														<Input placeholder="Avenida Paulista" {...field} disabled={isFetchingUserCep} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="user.adress.number"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Número</FormLabel>
													<FormControl>
														<Input placeholder="123" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="user.adress.complement"
											render={({ field }) => (
												<FormItem className="md:col-span-2">
													<FormLabel>Complemento (Opcional)</FormLabel>
													<FormControl>
														<Input placeholder="Apto 101, Bloco B" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<FormField
											control={control}
											name="user.adress.neighborhood"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bairro</FormLabel>
													<FormControl>
														<Input placeholder="Bela Vista" {...field} disabled={isFetchingUserCep} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="user.adress.city"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Cidade</FormLabel>
													<FormControl>
														<Input placeholder="São Paulo" {...field} disabled={isFetchingUserCep} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name="user.adress.state"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Estado</FormLabel>
													<Select onValueChange={field.onChange} value={field.value} disabled={isFetchingUserCep}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Selecione o estado">{field.value}</SelectValue>
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

							{/* Step 3 - Dados da organização */}
							{step === 3 && (
								<div className="space-y-6">
									<FormField
										control={control}
										name="organization.name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nome da Organização</FormLabel>
												<FormControl>
													<Input
														{...field}
														placeholder="Gabinete do João Paulo"
														onChange={(e) => {
															const nameValue = e.target.value
															// Atualiza o campo name normalmente
															field.onChange(nameValue)

															// if (!currentSlug) {
															setValue("organization.slug", slugify(nameValue), {
																shouldValidate: true,
																shouldDirty: true
															})
															// }
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="organization.slug"
										render={({ field }) => (
											<FormItem>
												<FormLabel>URL visível publicamente</FormLabel>
												<FormControl>
													<Input {...field} placeholder="gabinete-do-joao-paulo" onChange={(e) => field.onChange(slugify(e.target.value))} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}
						</div>

						<div className="flex justify-between pt-4">
							{step > 1 && (
								<Button type="button" variant="outline" onClick={prevStep} disabled={isFetchingUserCep}>
									<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
								</Button>
							)}
							{step < 3 && (
								<Button type="button" onClick={() => nextStep(step)} className={cn(step === 1 && "w-full")} disabled={isFetchingUserCep}>
									Próximo <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							)}
							{step === 3 && (
								<Button type="submit" disabled={formState.isSubmitting}>
									<UserPlus className="mr-2 h-4 w-4" />
									Cadastrar
								</Button>
							)}
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
