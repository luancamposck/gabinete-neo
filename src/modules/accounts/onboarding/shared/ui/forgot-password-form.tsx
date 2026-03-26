// @/modules/accounts/onboarding/shared/ui/forgot-password-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { type ForgotPasswordSchemaData, forgotPasswordSchema } from "@/modules/accounts/onboarding/shared/validations/forgot-password.schema"
import { requestPasswordResetAction } from "@/modules/auth/server/slices/request-password-reset/actions/request-password-reset.action"

export const ForgotPasswordForm = () => {
	const baseId = useId()
	const formId = `${baseId}-forgot-password-form`
	const emailId = `${baseId}-email`

	const form = useForm<ForgotPasswordSchemaData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: ""
		}
	})

	const { control, formState, handleSubmit } = form
	const { isSubmitting } = formState

	async function onSubmit(data: ForgotPasswordSchemaData) {
		try {
			const result = await requestPasswordResetAction(data)

			if (!result) {
				toast.error("Erro ao enviar link", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success) {
				toast.success("Link enviado", {
					description: result.message
				})
				return
			}

			toast.error("Não foi possível enviar", {
				description: result.message ?? "Verifique os dados e tente novamente."
			})
		} catch (error) {
			console.error("[requestPasswordResetAction] erro inesperado:", error)
			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<Card className="overflow-hidden border-3 contents">
				<CardContent className="p-0 pb-6 w-full">
					<form id={formId} onSubmit={handleSubmit(onSubmit)} className="p-6 pb-2 md:p-8" noValidate>
						<FieldSet>
							<div className="flex flex-col items-center text-center">
								<h1 className="text-2xl font-bold">Esqueceu sua senha?</h1>
								<p className="text-muted-foreground text-balance">Informe seu e-mail para receber o link de redefinição.</p>
							</div>
							<FieldGroup>
								<Controller
									name="email"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={emailId}>E-mail</FieldLabel>
											<Input {...field} id={emailId} placeholder="meu-email@gmail.com" type="email" autoComplete="email" aria-invalid={fieldState.invalid} disabled={isSubmitting} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</FieldGroup>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
							</Button>
						</FieldSet>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
