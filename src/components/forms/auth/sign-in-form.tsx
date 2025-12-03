"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { signInAuthUserAction } from "@/actions/auth/sign-in-auth-user.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { type SignInSchemaClientData, signInSchemaClient } from "@/lib/validations/auth/sign-in/sign-in-schema.client"

type SignInFormProps = React.ComponentProps<"div">

export const SignInAuthUserForm = ({ className, ...props }: SignInFormProps) => {
	const router = useRouter()

	const signInAuthUserForm = useForm<SignInSchemaClientData>({
		resolver: zodResolver(signInSchemaClient),
		defaultValues: {
			email: "",
			password: ""
		}
	})

	const { formState, control, handleSubmit } = signInAuthUserForm

	async function onSubmit(data: SignInSchemaClientData) {
		try {
			const result = await signInAuthUserAction(data)

			if (!result) {
				toast.error("Erro no login", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success && result.data) {
				toast.success("Usuário logado com sucesso!")

				router.push(result.data.redirectTo) // <- usa o destino calculado
			} else {
				toast.error("Erro no login", {
					description: result.message ?? "Verifique os dados e tente novamente."
				})
			}
		} catch (error) {
			console.error("[signInAuthUserAction] erro inesperado:", error)

			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden border-3 contents">
				<CardContent className="p-0 pb-6 w-full">
					<Form {...signInAuthUserForm}>
						<form onSubmit={handleSubmit(onSubmit)} className="p-6 pb-2 md:p-8" noValidate>
							<div className="flex flex-col gap-6">
								<div className="flex flex-col items-center text-center">
									<h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
									<p className="text-muted-foreground text-balance">Faça login na sua conta Gabinete NEO</p>
								</div>
								<FormField
									control={control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input placeholder="m@example.com" type="email" autoComplete="email" disabled={formState.isSubmitting} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<div className="flex items-center">
												<FormLabel>Senha</FormLabel>
												<Link href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
													Esqueceu sua senha?
												</Link>
											</div>
											<FormControl>
												<Input type="password" autoComplete="current-password" disabled={formState.isSubmitting} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-full" disabled={formState.isSubmitting}>
									{formState.isSubmitting ? "Entrando..." : "Login"}
								</Button>
								<div className="text-center text-sm">
									Ainda não tem uma conta?{" "}
									<Link href="#" className="underline underline-offset-4">
										Cadastre-se
									</Link>
								</div>
							</div>
						</form>
					</Form>
					<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
						Ao continuar, você concorda com nossos <Link href="#">Termos de Serviço</Link> e <Link href="#">Política de Privacidade</Link>.
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
