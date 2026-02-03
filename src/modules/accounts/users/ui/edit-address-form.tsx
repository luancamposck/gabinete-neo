// @/modules/accounts/users/shared/ui/edit-address-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, PencilLine, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { type FocusEvent, useId, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { brazilianStates } from "@/lib/constants/brazilian-states"
import { maskCep } from "@/lib/masks"
import { addressSchemaClient } from "@/modules/accounts/users/profiles/shared/validations/address.schema"
import { editUserAddressAction } from "../profiles/server/slices/edit-user-address/actions/edit-user-address.action"

type AddressFormValues = z.infer<typeof addressSchemaClient>

type EditAddressFormProps = {
	defaultValues: AddressFormValues
}

export const EditAddressForm = ({ defaultValues }: EditAddressFormProps) => {
	const baseId = useId()
	const formId = `${baseId}-edit-address-form`
	const cepId = `${baseId}-cep`
	const streetId = `${baseId}-street`
	const numberId = `${baseId}-number`
	const complementId = `${baseId}-complement`
	const neighborhoodId = `${baseId}-neighborhood`
	const cityId = `${baseId}-city`
	const stateId = `${baseId}-state`

	const [open, setOpen] = useState(false)
	const [isFetchingCep, setIsFetchingCep] = useState(false)
	const router = useRouter()

	const normalizedDefaultValues: AddressFormValues = {
		...defaultValues,
		cep: maskCep(defaultValues.cep ?? "")
	}

	const form = useForm<AddressFormValues>({
		resolver: zodResolver(addressSchemaClient),
		defaultValues: normalizedDefaultValues
	})

	const { control, handleSubmit, formState, reset, setFocus, setValue } = form

	async function handleCepBlur(e: FocusEvent<HTMLInputElement>) {
		const cep = e.target.value.replace(/\D/g, "")

		if (cep.length !== 8) {
			return
		}

		setIsFetchingCep(true)
		try {
			const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
			const data = await response.json()
			if (data.erro) {
				return
			}
			setValue("street", data.logradouro, { shouldValidate: true })
			setValue("neighborhood", data.bairro, { shouldValidate: true })
			setValue("city", data.localidade, { shouldValidate: true })
			setValue("state", data.uf, { shouldValidate: true })
			setFocus("number")
		} catch (error) {
			console.error("Falha ao buscar CEP:", error)
		} finally {
			setIsFetchingCep(false)
		}
	}

	async function onSubmit(data: AddressFormValues) {
		try {
			const result = await editUserAddressAction(data)

			if (!result) {
				toast.error("Erro ao atualizar endereço", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success) {
				toast.success("Endereço atualizado", {
					description: result.message
				})
				reset(data)
				setOpen(false)
				router.refresh()
				return
			}

			if (result.code === "unauthenticated") {
				return router.replace("/")
			}

			toast.error("Não foi possível atualizar", {
				description: result.message ?? "Verifique os dados e tente novamente."
			})
		} catch (error) {
			console.error("[editUserAddressAction] erro inesperado:", error)
			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" size="icon" className="rounded-full size-7" aria-label="Editar endereço">
					<PencilLine className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl max-h-[90%] overflow-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<MapPin className="h-4 w-4 text-primary" />
						Editar endereço
					</DialogTitle>
					<DialogDescription>Atualize os dados de localização do seu perfil.</DialogDescription>
				</DialogHeader>

				<form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<FieldSet>
						<FieldGroup>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<Controller
									name="cep"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="md:col-span-1">
											<FieldLabel htmlFor={cepId}>CEP</FieldLabel>
											<Input {...field} id={cepId} placeholder="00000-000" aria-invalid={fieldState.invalid} onChange={(event) => field.onChange(maskCep(event.target.value))} onBlur={handleCepBlur} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="street"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="md:col-span-2">
											<FieldLabel htmlFor={streetId}>Rua</FieldLabel>
											<Input {...field} id={streetId} placeholder="Avenida Paulista" aria-invalid={fieldState.invalid} disabled={isFetchingCep} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<Controller
									name="number"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={numberId}>Número</FieldLabel>
											<Input {...field} id={numberId} placeholder="123" aria-invalid={fieldState.invalid} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="complement"
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
									name="neighborhood"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={neighborhoodId}>Bairro</FieldLabel>
											<Input {...field} id={neighborhoodId} placeholder="Bela Vista" aria-invalid={fieldState.invalid} disabled={isFetchingCep} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="city"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={cityId}>Cidade</FieldLabel>
											<Input {...field} id={cityId} placeholder="São Paulo" aria-invalid={fieldState.invalid} disabled={isFetchingCep} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="state"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={stateId}>Estado</FieldLabel>
											<Select onValueChange={field.onChange} value={field.value} disabled={isFetchingCep}>
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
					</FieldSet>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={formState.isSubmitting}>
							Cancelar
						</Button>
						<Button type="submit" form={formId} disabled={formState.isSubmitting}>
							<Save className="mr-2 h-4 w-4" />
							Salvar alterações
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
