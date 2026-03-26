// @/modules/accounts/onboarding/shared/ui/register-and-join-form.tsx

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, AtSign, Flag, Hash, House, Lock, Mail, MapPin, Phone, User, UserPlus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useId, useMemo, useState } from "react"
import { Controller, type FieldPath, useForm } from "react-hook-form"
import { toast } from "sonner"
import { cn } from "@/lib/utils/cn"
import { registerAndJoinAction } from "@/modules/accounts/onboarding/server/slices/register-and-join/actions/register-and-join.action"
import { type RegisterAndJoinSchemaClientData, registerAndJoinSchemaClient } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card"
import { Combobox } from "@/shared/components/ui/combobox"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/shared/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { BRAZILIAN_CITIES_BY_STATE } from "@/shared/constants/brazilian-cities-by-state"
import { brazilianStates } from "@/shared/constants/brazilian-states"
import { RELATIONSHIP_OPTIONS } from "@/shared/constants/relationship-options"
import { maskCep } from "@/shared/masks/mask-cep"
import { maskPhone } from "@/shared/masks/mask-phone"

export const RegisterAndJoinForm = () => {
	const baseId = useId()
	const formId = `${baseId}-register-and-join-form`
	const nameId = `${baseId}-name`
	const usernameId = `${baseId}-username`
	const phoneId = `${baseId}-phone`
	const emailId = `${baseId}-email`
	const confirmEmailId = `${baseId}-confirm-email`
	const passwordId = `${baseId}-password`
	const confirmPasswordId = `${baseId}-confirm-password`
	const relationshipToInviterId = `${baseId}-relationship-to-inviter`
	const cepId = `${baseId}-cep`
	const streetId = `${baseId}-street`
	const numberId = `${baseId}-number`
	const complementId = `${baseId}-complement`
	const neighborhoodId = `${baseId}-neighborhood`
	const stateId = `${baseId}-state`

	const router = useRouter()
	const [step, setStep] = useState<number>(1)
	const [isFetchingUserCep, setIsFetchingUserCep] = useState<boolean>(false)
	const [isUsernameTouched, setIsUsernameTouched] = useState<boolean>(false)
	const [cepFilled, setCepFilled] = useState<boolean>(false)
	const searchParams = useSearchParams()

	// Exemplo no client: const ref = useSearchParams().get("ref") ?? undefined
	// e registerAndJoinAction({ ...formValues, ref })
	const ref = searchParams.get("ref")?.trim() || undefined
	const showRelationshipField = Boolean(ref)

	const registerAndJoinForm = useForm<RegisterAndJoinSchemaClientData>({
		resolver: zodResolver(registerAndJoinSchemaClient),
		defaultValues: {
			name: "",
			username: "",
			phone: "",
			email: "",
			confirmEmail: "",
			password: "",
			confirmPassword: "",
			relationshipToInviter: undefined,
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

	const { control, handleSubmit, formState, setValue, setFocus, trigger, resetField, reset, watch } = registerAndJoinForm

	const selectedState = watch("address.state")

	const cityItems = useMemo(() => {
		if (!selectedState) return []
		const cities = BRAZILIAN_CITIES_BY_STATE[selectedState] ?? []
		return cities.map((city) => ({ value: city, label: city }))
	}, [selectedState])

	const normalizeUsername = (value: string) =>
		value
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "")

	const generateUsernameFromName = (name: string) => {
		const words = name.trim().split(/\s+/).filter(Boolean)
		if (words.length === 0) return ""
		if (words.length === 1) return normalizeUsername(words[0])

		const firstName = words[0]
		const lastName = words[words.length - 1]
		return normalizeUsername(`${firstName}${lastName}`)
	}

	async function handleUserCepBlur(e: React.FocusEvent<HTMLInputElement>) {
		const cep = e.target.value.replace(/\D/g, "")

		if (cep.length !== 8) {
			setCepFilled(false)
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
				resetField("address.state")
				setCepFilled(false)
				return
			}
			setValue("address.street", data.logradouro, { shouldValidate: true })
			setValue("address.neighborhood", data.bairro, { shouldValidate: true })
			setValue("address.state", data.uf, { shouldValidate: true })
			setValue("address.city", "", { shouldValidate: false })
			setCepFilled(true)
			setFocus("address.number")
		} catch (error) {
			console.error("Falha ao buscar CEP:", error)
			toast.error("Erro ao buscar CEP", {
				description: "Nao foi possivel buscar os dados do endereco. Tente novamente."
			})
			setCepFilled(false)
		} finally {
			setIsFetchingUserCep(false)
		}
	}

	function handleStateChange(newState: string, fieldOnChange: (value: string) => void) {
		fieldOnChange(newState)
		setValue("address.city", "", { shouldValidate: false })
	}

	function handleCepChange(rawValue: string, fieldOnChange: (value: string) => void) {
		const masked = maskCep(rawValue)
		fieldOnChange(masked)
		const digits = rawValue.replace(/\D/g, "")
		if (digits.length < 8) {
			setCepFilled(false)
		}
	}

	const prevStep = () => setStep((prev) => prev - 1)

	async function nextStep(currentStep: number) {
		let fieldsToValidate: FieldPath<RegisterAndJoinSchemaClientData>[] = []

		if (currentStep === 1) {
			fieldsToValidate = ["name", "username", "phone", "email", "confirmEmail", "password", "confirmPassword"]
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
				username: data.username,
				phone: data.phone,
				email: data.email,
				password: data.password,
				address: data.address,
				ref: ref,
				relationshipToInviter: showRelationshipField ? data.relationshipToInviter : undefined
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
				setIsUsernameTouched(false)

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
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<User className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput
													{...field}
													id={nameId}
													placeholder="Luan Campos"
													aria-invalid={fieldState.invalid}
													onChange={(event) => {
														field.onChange(event)
														if (!isUsernameTouched) {
															const nextUsername = generateUsernameFromName(event.target.value)
															setValue("username", nextUsername)
														}
													}}
												/>
											</InputGroup>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<Controller
									name="username"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={usernameId}>Username</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<AtSign className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput
													{...field}
													id={usernameId}
													placeholder="ex: luancamposck"
													aria-invalid={fieldState.invalid}
													onChange={(event) => {
														const nextUsername = normalizeUsername(event.target.value)
														setIsUsernameTouched(true)
														field.onChange(nextUsername)
													}}
												/>
											</InputGroup>
											<FieldDescription>Somente letras minúsculas e números, sem espaços.</FieldDescription>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>

								<div className="grid grid-cols-1 gap-6">
									<Controller
										name="phone"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={phoneId}>Celular</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Phone className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput {...field} id={phoneId} placeholder="(11) 99999-9999" aria-invalid={fieldState.invalid} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
									{showRelationshipField && (
										<Controller
											name="relationshipToInviter"
											control={control}
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<FieldLabel htmlFor={relationshipToInviterId}>Relacao com quem convidou</FieldLabel>
													<Select onValueChange={field.onChange} value={field.value ?? ""}>
														<SelectTrigger id={relationshipToInviterId} aria-invalid={fieldState.invalid}>
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
													{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
												</Field>
											)}
										/>
									)}
								</div>

								<Controller
									name="email"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={emailId}>Email do usuario</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<Mail className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput {...field} id={emailId} type="email" placeholder="seu-email@gmail.com" aria-invalid={fieldState.invalid} />
											</InputGroup>
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
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<Mail className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput {...field} id={confirmEmailId} type="email" placeholder="seu-email@gmail.com" aria-invalid={fieldState.invalid} />
											</InputGroup>
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
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<Lock className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput {...field} id={passwordId} type="password" placeholder="********" aria-invalid={fieldState.invalid} />
											</InputGroup>
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
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<Lock className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput {...field} id={confirmPasswordId} type="password" placeholder="********" aria-invalid={fieldState.invalid} />
											</InputGroup>
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
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Hash className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput {...field} id={cepId} placeholder="00000-000" aria-invalid={fieldState.invalid} onChange={(e) => handleCepChange(e.target.value, field.onChange)} onBlur={handleUserCepBlur} />
												</InputGroup>
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
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<MapPin className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput
														{...field}
														id={streetId}
														placeholder="Avenida Paulista"
														aria-invalid={fieldState.invalid}
														disabled={isFetchingUserCep}
														readOnly={cepFilled}
														className={cepFilled ? "bg-muted cursor-not-allowed" : ""}
													/>
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<Controller
										name="address.number"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={numberId}>Numero</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<Hash className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput {...field} id={numberId} placeholder="123" aria-invalid={fieldState.invalid} />
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
									<Controller
										name="address.neighborhood"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={neighborhoodId}>Bairro</FieldLabel>
												<InputGroup>
													<InputGroupAddon align="inline-start">
														<InputGroupText>
															<House className="h-4 w-4" />
														</InputGroupText>
													</InputGroupAddon>
													<InputGroupInput
														{...field}
														id={neighborhoodId}
														placeholder="Bela Vista"
														aria-invalid={fieldState.invalid}
														disabled={isFetchingUserCep}
														readOnly={cepFilled}
														className={cepFilled ? "bg-muted cursor-not-allowed" : ""}
													/>
												</InputGroup>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<Controller
										name="address.state"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={stateId}>Estado</FieldLabel>
												<Select onValueChange={(val) => handleStateChange(val, field.onChange)} value={field.value} disabled={isFetchingUserCep}>
													<SelectTrigger id={stateId} aria-invalid={fieldState.invalid} className="gap-2">
														<Flag className="h-4 w-4 text-muted-foreground" />
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
									<Controller
										name="address.city"
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel>Cidade</FieldLabel>
												<Combobox
													items={cityItems}
													value={field.value}
													onValueChange={field.onChange}
													placeholder="Selecione a cidade"
													searchPlaceholder="Buscar cidade..."
													emptyMessage="Nenhuma cidade encontrada."
													disabled={!selectedState || isFetchingUserCep}
												/>
												{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
											</Field>
										)}
									/>
								</div>
								<Controller
									name="address.complement"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="md:col-span-2">
											<FieldLabel htmlFor={complementId}>Complemento (Opcional)</FieldLabel>
											<InputGroup>
												<InputGroupAddon align="inline-start">
													<InputGroupText>
														<House className="h-4 w-4" />
													</InputGroupText>
												</InputGroupAddon>
												<InputGroupInput {...field} id={complementId} placeholder="Apto 101, Bloco B" aria-invalid={fieldState.invalid} />
											</InputGroup>
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
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
