# Simple Sign In Form Reference

This file is a reference only. Do not import it. Do not compile it.

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail } from "lucide-react"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/shared/components/ui/input-group"

const simpleSignInSchema = z.object({
	email: z.email("Informe um e-mail válido."),
	password: z.string().min(1, "Informe sua senha.")
})

type SimpleSignInFormData = z.infer<typeof simpleSignInSchema>

export const SimpleSignInForm = () => {
	const baseId = useId()
	const formId = `${baseId}-simple-sign-in-form`
	const emailId = `${baseId}-email`
	const passwordId = `${baseId}-password`

	const form = useForm<SimpleSignInFormData>({
		resolver: zodResolver(simpleSignInSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	})

	const { control, handleSubmit, formState } = form

	async function onSubmit(data: SimpleSignInFormData) {
		console.log(data)
	}

	return (
		<form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<FieldGroup>
				<Controller
					name="email"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={emailId}>E-mail</FieldLabel>

							<InputGroup>
								<InputGroupAddon align="inline-start">
									<InputGroupText>
										<Mail className="h-4 w-4" />
									</InputGroupText>
								</InputGroupAddon>

								<InputGroupInput {...field} id={emailId} type="email" placeholder="seu-email@gmail.com" autoComplete="email" aria-invalid={fieldState.invalid} />
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

								<InputGroupInput {...field} id={passwordId} type="password" placeholder="Digite sua senha" autoComplete="current-password" aria-invalid={fieldState.invalid} />
							</InputGroup>

							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</FieldGroup>

			<Button type="submit" form={formId} className="w-full" disabled={formState.isSubmitting}>
				{formState.isSubmitting ? "Entrando..." : "Entrar"}
			</Button>
		</form>
	)
}
```
