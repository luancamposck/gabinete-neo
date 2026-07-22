// @/modules/auth/ui/sign-in-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { signInAction } from "@/modules/auth/server/slices/sign-in/actions/sign-in.action"
import { type SignInSchemaData, signInSchema } from "@/modules/auth/shared/validations/sign-in.schema"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

type SignInFormProps = {
	organizationName: string
	onSwitchToSignup?: () => void
}

export const SignInForm = ({ organizationName, onSwitchToSignup }: SignInFormProps) => {
	const baseId = useId()
	const formId = `${baseId}-sign-in-form`
	const emailId = `${baseId}-email`
	const passwordId = `${baseId}-password`

	const router = useRouter()

	const signInForm = useForm<SignInSchemaData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	})

	const { control, formState, handleSubmit } = signInForm
	const { isSubmitting } = formState

	async function onSubmit(data: SignInSchemaData) {
		try {
			const result = await signInAction(data)

			if (!result) {
				toast.error("Erro no login", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success && result.data) {
				toast.success(result.message ?? "Login realizado com sucesso.")

				router.push("/dashboard")
			} else {
				toast.error("Erro no login", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
			}
		} catch (error) {
			console.error("[signInAction] erro inesperado:", error)

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
								<h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
								<p className="text-muted-foreground text-balance">Faca login na sua conta {organizationName}</p>
							</div>
							<FieldGroup>
								<Controller
									name="email"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={emailId}>Email</FieldLabel>
											<Input {...field} id={emailId} placeholder="meu-email@gmail.com" type="email" autoComplete="email" aria-invalid={fieldState.invalid} disabled={isSubmitting} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
								<Controller
									name="password"
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<div className="flex items-center">
												<FieldLabel htmlFor={passwordId}>Senha</FieldLabel>
												<Link href="/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
													Esqueceu sua senha?
												</Link>
											</div>
											<Input {...field} id={passwordId} placeholder="******" type="password" autoComplete="current-password" aria-invalid={fieldState.invalid} disabled={isSubmitting} />
											{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
										</Field>
									)}
								/>
							</FieldGroup>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? "Entrando..." : "Login"}
							</Button>
							<div className="text-center text-sm">
								Ainda nao tem uma conta?{" "}
								<button type="button" onClick={onSwitchToSignup} className="font-medium underline underline-offset-4 hover:text-primary">
									Cadastre-se
								</button>
							</div>
						</FieldSet>
					</form>
					<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
						Ao continuar, voce concorda com nossos <Link href="#">Termos de Servico</Link> e <Link href="#">Politica de Privacidade</Link>.
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
