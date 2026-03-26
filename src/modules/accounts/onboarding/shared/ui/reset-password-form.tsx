// @/modules/accounts/onboarding/shared/ui/reset-password-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { type ResetPasswordSchemaData, resetPasswordSchema } from "@/modules/accounts/onboarding/shared/validations/reset-password.schema"
import { updatePasswordAction } from "@/modules/auth/server/slices/update-password/actions/update-password.action"

export const ResetPasswordForm = () => {
	const router = useRouter()

	const baseId = useId()
	const formId = `${baseId}-reset-password-form`
	const passwordId = `${baseId}-password`
	const confirmPasswordId = `${baseId}-confirm-password`

	const form = useForm<ResetPasswordSchemaData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	})

	const { control, formState, handleSubmit, reset } = form
	const { isSubmitting } = formState

	async function onSubmit(data: ResetPasswordSchemaData) {
		try {
			const result = await updatePasswordAction(data)

			if (!result) {
				toast.error("Erro ao atualizar senha", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success) {
				toast.success("Senha atualizada", {
					description: result.message
				})
				reset()
				router.replace("/dashboard")
				return
			}

			toast.error("Não foi possível atualizar", {
				description: result.message ?? "Verifique os dados e tente novamente."
			})
		} catch (error) {
			console.error("[updatePasswordAction] erro inesperado:", error)
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
								<h1 className="text-2xl font-bold">Crie uma nova senha</h1>
								<p className="text-muted-foreground text-balance">Digite e confirme sua nova senha.</p>
							</div>
							<FieldGroup>
								<Controller
									name="password"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={passwordId}>Nova senha</FieldLabel>
											<Input {...field} id={passwordId} placeholder="********" type="password" autoComplete="new-password" aria-invalid={fieldState.invalid} disabled={isSubmitting} />
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
											<Input {...field} id={confirmPasswordId} placeholder="********" type="password" autoComplete="new-password" aria-invalid={fieldState.invalid} disabled={isSubmitting} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</FieldGroup>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Atualizando..." : "Atualizar senha"}
							</Button>
						</FieldSet>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
