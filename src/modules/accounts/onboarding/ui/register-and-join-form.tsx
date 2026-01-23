// @/modules/accounts/onboarding/ui/register-and-join-form.tsx

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { Controller, type FieldPath, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brazilianStates } from "@/lib/constants/brazilian-states"
import { maskCep, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { registerAndJoinAction } from "@/modules/accounts/onboarding/server/slices/register-and-join/actions/register-and-join.action"
import { type RegisterAndJoinSchemaClientData, registerAndJoinSchemaClient } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"

export const RegisterAndJoinForm = () => {
	const baseId = useId()
	const formId = `${baseId}-register-and-join-form`
	const nameId = `${baseId}-name`
	const phoneId = `${baseId}-phone`
	const emailId = `${baseId}-email`
	const confirmEmailId = `${baseId}-confirm-email`
	const passwordId = `${baseId}-password`
	const confirmPasswordId = `${baseId}-confirm-password`
	const cepId = `${baseId}-cep`
	const streetId = `${baseId}-street`
	const numberId = `${baseId}-number`
	const complementId = `${baseId}-complement`
	const neighborhoodId = `${baseId}-neighborhood`
	const cityId = `${baseId}-city`
	const stateId = `${baseId}-state`

	const router = useRouter()
	const [step, setStep] = useState<number>(1)
	const [isFetchingUserCep, setIsFetchingUserCep] = useState<boolean>(false)

	const registerAndJoinForm = useForm<RegisterAndJoinSchemaClientData>({
		resolver: zodResolver(registerAndJoinSchemaClient),
		defaultValues: {
			name: "",
			phone: "",
			email: "",
			confirmEmail: "",
			password: "",
			confirmPassword: "",
			address: {
				cep: "",
				street: "",
				number: "",
				neighborhood: "",
				city: "",
				state: "",
				complement: ""
			}
		}
	})

	const { control, handleSubmit, formState, setValue, setFocus, trigger, resetField, reset } = registerAndJoinForm

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
				toast.error("CEP nao encontrado", {
					description: "Por favor, verifique o CEP digitado."
				})
				resetField("address.street")
				resetField("address.neighborhood")
				resetField("address.city")
				resetField("address.state")
				return
			}
			setValue("address.street", data.logradouro, { shouldValidate: true })
			setValue("address.neighborhood", data.bairro, { shouldValidate: true })
			setValue("address.city", data.localidade, { shouldValidate: true })
			setValue("address.state", data.uf, { shouldValidate: true })
			setFocus("address.number")
		} catch (error) {
			console.error("Falha ao buscar CEP:", error)
			toast.error("Erro ao buscar CEP", {
				description: "Nao foi possivel buscar os dados do endereco. Tente novamente."
			})
		} finally {
			setIsFetchingUserCep(false)
		}
	}

	const prevStep = () => setStep((prev) => prev - 1)

	async function nextStep(currentStep: number) {
		let fieldsToValidate: FieldPath<RegisterAndJoinSchemaClientData>[] = []

		if (currentStep === 1) {
			fieldsToValidate = ["name", "phone", "email", "confirmEmail", "password", "confirmPassword"]
		} else if (currentStep === 2) {
			fieldsToValidate = ["address.cep", "address.street", "address.number", "address.neighborhood", "address.city", "address.state"]
		}

		const output = await trigger(fieldsToValidate, { shouldFocus: true })
		if (output) {
			setStep(currentStep + 1)
		}
	}

	async function onSubmit(data: RegisterAndJoinSchemaClientData) {
		try {
			const result = await registerAndJoinAction({
				name: data.name,
				phone: data.phone,
				email: data.email,
				password: data.password,
				address: data.address
			})

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

				if (result.data) {
					router.push("/dashboard")
				}
			} else {
				toast.error("Erro no cadastro", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
			}
		} catch (error) {
			console.error("[registerAndJoinAction] erro inesperado:", error)

			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<Card className={cn("w-full border-0 shadow-none")}>
			<CardHeader>
				<div className="flex w-full items-start pt-6">
					<div className="flex flex-1 flex-col items-center">
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 1 ? "text-primary" : "text-muted-foreground")}>Usuario</p>
					</div>
					<div className={cn("mt-4 h-1 flex-1 bg-border transition-colors", step > 1 && "bg-primary")} />
					<div className="flex flex-1 flex-col items-center">
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold transition-all", step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
						<p className={cn("mt-2 text-sm font-medium", step >= 2 ? "text-primary" : "text-muted-foreground")}>Endereco</p>
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FieldSet>
						{step === 1 && (
							<FieldGroup>
								<Controller
									name="name"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={nameId}>Nome do Usuario</FieldLabel>
											<Input {...field} id={nameId} placeholder="Joao da Silva" aria-invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<Controller
										name="phone"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={phoneId}>Celular</FieldLabel>
												<Input {...field} id={phoneId} placeholder="(11) 99999-9999" aria-invalid={fieldState.invalid} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>

								<Controller
									name="email"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={emailId}>Email do usuario</FieldLabel>
											<Input {...field} id={emailId} type="email" placeholder="seu-email@suaempresa.com" aria-invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<Controller
									name="confirmEmail"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={confirmEmailId}>Confirmar email do usuario</FieldLabel>
											<Input {...field} id={confirmEmailId} type="email" placeholder="confirme.contato@suaempresa.com" aria-invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<Controller
									name="password"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
											<Input {...field} id={passwordId} type="password" placeholder="********" aria-invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<Controller
									name="confirmPassword"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={confirmPasswordId}>Confirmar senha</FieldLabel>
											<Input {...field} id={confirmPasswordId} type="password" placeholder="********" aria-invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</FieldGroup>
						)}

						{step === 2 && (
							<FieldGroup>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
									<Controller
										name="address.cep"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid} className="md:col-span-1">
												<FieldLabel htmlFor={cepId}>CEP</FieldLabel>
												<Input {...field} id={cepId} placeholder="00000-000" aria-invalid={fieldState.invalid} onChange={(e) => field.onChange(maskCep(e.target.value))} onBlur={handleUserCepBlur} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
									<Controller
										name="address.street"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid} className="md:col-span-2">
												<FieldLabel htmlFor={streetId}>Rua</FieldLabel>
												<Input {...field} id={streetId} placeholder="Avenida Paulista" aria-invalid={fieldState.invalid} disabled={isFetchingUserCep} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
									<Controller
										name="address.number"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={numberId}>Numero</FieldLabel>
												<Input {...field} id={numberId} placeholder="123" aria-invalid={fieldState.invalid} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
									<Controller
										name="address.complement"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid} className="md:col-span-2">
												<FieldLabel htmlFor={complementId}>Complemento (Opcional)</FieldLabel>
												<Input {...field} id={complementId} placeholder="Apto 101, Bloco B" aria-invalid={fieldState.invalid} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
									<Controller
										name="address.neighborhood"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={neighborhoodId}>Bairro</FieldLabel>
												<Input {...field} id={neighborhoodId} placeholder="Bela Vista" aria-invalid={fieldState.invalid} disabled={isFetchingUserCep} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
									<Controller
										name="address.city"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={cityId}>Cidade</FieldLabel>
												<Input {...field} id={cityId} placeholder="Sao Paulo" aria-invalid={fieldState.invalid} disabled={isFetchingUserCep} />
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
									<Controller
										name="address.state"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={stateId}>Estado</FieldLabel>
												<Select onValueChange={field.onChange} value={field.value} disabled={isFetchingUserCep}>
													<SelectTrigger id={stateId} aria-invalid={fieldState.invalid}>
														<SelectValue placeholder="Selecione o estado" />
													</SelectTrigger>
													<SelectContent>
														{brazilianStates.map((state) => (
															<SelectItem key={state.value} value={state.value}>
																{state.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
							</FieldGroup>
						)}
					</FieldSet>

					<div className="flex justify-between pt-4">
						{step > 1 && (
							<Button type="button" variant="outline" onClick={prevStep} disabled={isFetchingUserCep}>
								<ArrowLeft className="mr-2 h-4 w-4" /> Voltar
							</Button>
						)}
						{step < 2 && (
							<Button type="button" onClick={() => nextStep(step)} className={cn(step === 1 && "w-full")} disabled={isFetchingUserCep}>
								Proximo <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						)}
						{step === 2 && (
							<Button type="submit" form={formId} disabled={formState.isSubmitting}>
								<UserPlus className="mr-2 h-4 w-4" />
								Cadastrar
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
