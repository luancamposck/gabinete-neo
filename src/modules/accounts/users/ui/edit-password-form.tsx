// @/modules/accounts/users/shared/ui/edit-password-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useId, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { updatePasswordAction } from "@/modules/auth/server/slices/update-password/actions/update-password.action"

const passwordSchema = z.string().min(8, "A senha deve ter no minimo 8 caracteres.")

const editPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: passwordSchema
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas nao coincidem.",
		path: ["confirmPassword"]
	})

type EditPasswordFormValues = z.infer<typeof editPasswordSchema>

export const EditPasswordForm = () => {
	const baseId = useId()
	const passwordId = `${baseId}-password`
	const confirmPasswordId = `${baseId}-confirm-password`

	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const form = useForm<EditPasswordFormValues>({
		resolver: zodResolver(editPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: ""
		}
	})

	const { control, handleSubmit, formState, reset } = form
	const isSubmitting = formState.isSubmitting
	const isSubmitDisabled = isSubmitting || !formState.isDirty

	async function onSubmit(data: EditPasswordFormValues) {
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
				reset({
					password: "",
					confirmPassword: ""
				})
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
		<Accordion type="single" collapsible>
			<AccordionItem value="change-password" className="border-0">
				<AccordionTrigger className="py-0 text-sm font-medium">MUDAR SENHA</AccordionTrigger>
				<AccordionContent className="pt-4">
					<form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 text-sm px-1 md:px-0">
						<Controller
							name="password"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="gap-1">
									<FieldLabel htmlFor={passwordId} className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
										Senha
									</FieldLabel>
									<InputGroup className="rounded-md border-0 bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground shadow-none">
										<InputGroupInput {...field} id={passwordId} type={showPassword ? "text" : "password"} autoComplete="new-password" disabled={isSubmitting} className="h-auto p-0 text-xs text-muted-foreground" />
										<InputGroupAddon align="inline-end" className="pr-0">
											<InputGroupButton type="button" size="icon-xs" variant="ghost" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((prev) => !prev)} disabled={isSubmitting}>
												{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="confirmPassword"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="gap-1">
									<FieldLabel htmlFor={confirmPasswordId} className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
										Confirmar senha
									</FieldLabel>
									<InputGroup className="rounded-md border-0 bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground shadow-none">
										<InputGroupInput
											{...field}
											id={confirmPasswordId}
											type={showConfirmPassword ? "text" : "password"}
											autoComplete="new-password"
											disabled={isSubmitting}
											className="h-auto p-0 text-xs text-muted-foreground"
										/>
										<InputGroupAddon align="inline-end" className="pr-0">
											<InputGroupButton
												type="button"
												size="icon-xs"
												variant="ghost"
												aria-label={showConfirmPassword ? "Ocultar confirmacao de senha" : "Mostrar confirmacao de senha"}
												onClick={() => setShowConfirmPassword((prev) => !prev)}
												disabled={isSubmitting}
											>
												{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Button type="submit" variant="destructive" disabled={isSubmitDisabled}>
							{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mudar Senha"}
						</Button>
					</form>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}
