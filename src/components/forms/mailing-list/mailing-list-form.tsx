"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { FocusEvent } from "react"
import { startTransition, useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { createMailingListEntry } from "@/actions/mailing-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { brazilianStates } from "@/lib/constants/brazilian-states"
import { maskCep, maskPhone } from "@/lib/masks"
import { cn } from "@/lib/utils"
import { type MailingListFormValues, mailingListFormSchema } from "@/lib/validations/mailing-list-schema"

type AddressFormProps = React.ComponentProps<"div">

type CepResponse = {
	street?: string
	neighborhood?: string
	city?: string
	state?: string
}

export const AddressForm = ({ className, ...props }: AddressFormProps) => {
	const [isFetchingCep, setIsFetchingCep] = useState<boolean>(false)

	const form = useForm<MailingListFormValues>({
		resolver: zodResolver(mailingListFormSchema),
		defaultValues: {
			name: "",
			phone_number: "",
			postal_code: "",
			street: "",
			number: "",
			complement: "",
			neighborhood: "",
			city: "",
			state: ""
		}
	})

	const clearAddressFields = useCallback(() => {
		form.setValue("street", "")
		form.setValue("neighborhood", "")
		form.setValue("city", "")
		form.setValue("state", "")
	}, [form])

	const fetchCepData = useCallback(
		async (postalCode: string) => {
			if (!postalCode) {
				clearAddressFields()
				return
			}

			if (postalCode.length !== 8) {
				toast.error("CEP não encontrado ou inválido")
				return
			}

			setIsFetchingCep(true)

			try {
				const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${postalCode}`)

				if (!response.ok) {
					throw new Error("CEP lookup failed")
				}

				const data: CepResponse = await response.json()

				form.setValue("street", data.street ?? "", {
					shouldDirty: true,
					shouldTouch: true
				})
				form.setValue("neighborhood", data.neighborhood ?? "", {
					shouldDirty: true,
					shouldTouch: true
				})
				form.setValue("city", data.city ?? "", {
					shouldDirty: true,
					shouldTouch: true
				})
				form.setValue("state", data.state ?? "", {
					shouldDirty: true,
					shouldTouch: true
				})

				toast.success("Endereço preenchido automaticamente")
			} catch (_) {
				toast.error("CEP não encontrado ou inválido")
			} finally {
				setIsFetchingCep(false)
			}
		},
		[clearAddressFields, form]
	)

	function onSubmit(values: MailingListFormValues) {
		startTransition(() => {
			createMailingListEntry({
				...values,
				phone_number: Number(values.phone_number.replace(/\D/g, ""))
			})
				.then((response) => {
					if (!response.success) {
						toast.error(response.message)
						return
					}

					toast.success(response.message)
					form.reset()
				})
				.catch(() => {
					toast.error("Não foi possível conectar ao servidor")
				})
		})
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Cadastro de Endereço</CardTitle>
					<CardDescription>Preencha as informações abaixo para adicionar um novo endereço.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nome Completo</FormLabel>
										<FormControl>
											<Input placeholder="Ex: João da Silva" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<FormField
									control={form.control}
									name="phone_number"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Telefone</FormLabel>
											<FormControl>
												<Input placeholder="(99) 99999-9999" {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="postal_code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>CEP</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														autoComplete="cep"
														placeholder="00000-000"
														{...field}
														onBlur={async (event: FocusEvent<HTMLInputElement>) => {
															field.onBlur()
															const sanitizedCep = event.target.value.replace(/\D/g, "")
															await fetchCepData(sanitizedCep)
														}}
														onChange={(event) => {
															const maskedValue = maskCep(event.target.value)
															field.onChange(maskedValue)
															const sanitizedCep = maskedValue.replace(/\D/g, "")
															if (!sanitizedCep) {
																clearAddressFields()
															}
														}}
														className={cn(isFetchingCep && "pr-10")}
													/>
													{isFetchingCep && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="street"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rua</FormLabel>
										<FormControl>
											<Input placeholder="Ex: Rua das Flores" disabled={isFetchingCep} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<FormField
									control={form.control}
									name="number"
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
									control={form.control}
									name="complement"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Complemento (opcional)</FormLabel>
											<FormControl>
												<Textarea placeholder="Ex: Apto 101, Bloco B" className="h-24 resize-none" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
								<FormField
									control={form.control}
									name="neighborhood"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bairro</FormLabel>
											<FormControl>
												<Input placeholder="Ex: Centro" disabled={isFetchingCep} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Cidade</FormLabel>
											<FormControl>
												<Input placeholder="Ex: São Paulo" disabled={isFetchingCep} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="state"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Estado</FormLabel>
											<Select onValueChange={field.onChange} value={field.value || undefined} disabled={isFetchingCep}>
												<FormControl>
													<SelectTrigger disabled={isFetchingCep}>
														<SelectValue placeholder="Selecione um estado" />
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

							<div className="flex justify-end">
								<Button type="submit">Cadastrar Endereço</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
