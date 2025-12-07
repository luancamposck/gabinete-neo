"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { type FieldPath, useForm } from "react-hook-form"
import { toast } from "sonner"
import { createUserWithInvitationAction } from "@/actions/create-user-with-invitation.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brazilianStates } from "@/lib/constants/brazilian-states"
import { RELATIONSHIP_OPTIONS } from "@/lib/constants/relationship-options"
import { maskCep, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { type CreateUserWithInvitationSchemaClientData, createUserWithInvitationSchemaClient } from "@/lib/validations/use-cases/create-user-with-invitation-schemas/create-user-with-invitation-schemas.client"

interface CreateUserWithInvitationFormProps {
	inviterUserId: string
	organizationId: string
}

export const CreateUserWithInvitationForm = ({ inviterUserId, organizationId }: CreateUserWithInvitationFormProps) => {
	const router = useRouter()
	const [step, setStep] = useState<number>(1)
	const [isFetchingUserCep, setIsFetchingUserCep] = useState<boolean>(false)

	const createUserWithInvitationForm = useForm<CreateUserWithInvitationSchemaClientData>({
		resolver: zodResolver(createUserWithInvitationSchemaClient),
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
			}
		}
	})

	const { control, handleSubmit, formState, setValue, setFocus, trigger, resetField, reset } = createUserWithInvitationForm

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
		let fieldsToValidate: FieldPath<CreateUserWithInvitationSchemaClientData>[] = []

		if (currentStep === 1) {
			fieldsToValidate = ["user.name", "user.phone", "user.email", "user.confirmEmail", "user.password", "user.confirmPassword", "relationship"]
		} else if (currentStep === 2) {
			fieldsToValidate = ["user.adress.cep", "user.adress.street", "user.adress.number", "user.adress.neighborhood", "user.adress.city", "user.adress.state"]
		}

		const output = await trigger(fieldsToValidate, { shouldFocus: true })
		if (output) {
			setStep(currentStep + 1)
		}
	}

	async function onSubmit(data: CreateUserWithInvitationSchemaClientData) {
		try {
			const createUserWithInvitationActionParams = {
				user: data.user,
				relationship: data.relationship,
				inviterUserId,
				organizationId
			}
			const result = await createUserWithInvitationAction(createUserWithInvitationActionParams)

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

				if (result.success && result.data) {
					toast.success("Pedido de acesso enviado com sucesso!", {
						description: "Aguarde aprovação"
					})

					router.push("/") // <- usa o destino calculado
				} else {
					toast.error("Erro ao enviar pedido", {
						description: result.message ?? "Verifique os dados e tente novamente."
					})
				}
			} else {
				toast.error("Erro no cadastro", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
			}
		} catch (error) {
			console.error("[createUserWithInvitationAction] erro inesperado:", error)

			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

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
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<Form {...createUserWithInvitationForm}>
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

									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
											name="relationship"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Relação com quem convidou</FormLabel>
													<FormControl>
														<Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
															<SelectTrigger>
																<SelectValue placeholder="Selecione a relação" />
															</SelectTrigger>
															<SelectContent>
																{RELATIONSHIP_OPTIONS.map((opt) => (
																	<SelectItem key={opt.value} value={opt.value}>
																		{opt.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

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
						</div>

						<div className="flex justify-between pt-4">
							{step > 1 && (
								<Button type="button" variant="outline" onClick={prevStep} disabled={isFetchingUserCep}>
									<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
								</Button>
							)}
							{step < 2 && (
								<Button type="button" onClick={() => nextStep(step)} className={cn(step === 1 && "w-full")} disabled={isFetchingUserCep}>
									Próximo <ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							)}
							{step === 2 && (
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
