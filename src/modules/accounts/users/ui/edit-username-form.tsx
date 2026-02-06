// @/modules/accounts/users/shared/ui/edit-username-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Loader2, PencilLine } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { usernameSchema } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"
import { editUsernameAction } from "@/modules/accounts/users/server/slices/edit-username/actions/edit-username.action"
import { useReferralLinkStorage } from "@/shared/hooks/use-referral-link-storage"

const editUsernameSchema = z.object({
	username: usernameSchema
})

type EditUsernameFormValues = z.infer<typeof editUsernameSchema>

type EditUsernameFormProps = {
	defaultValue: string
}

export const EditUsernameForm = ({ defaultValue }: EditUsernameFormProps) => {
	const baseId = useId()
	const inputId = `${baseId}-username`

	const [isEditing, setIsEditing] = useState<boolean>(false)
	const router = useRouter()
	const { clearReferralUrl } = useReferralLinkStorage()

	const form = useForm<EditUsernameFormValues>({
		resolver: zodResolver(editUsernameSchema),
		defaultValues: {
			username: defaultValue
		}
	})

	const { control, handleSubmit, setFocus, formState } = form
	const isSubmitting = formState.isSubmitting

	const normalizeUsername = (value: string) =>
		value
			.toLowerCase()
			.replace(/\s+/g, "_")
			.replace(/[^a-z0-9_]/g, "")

	// ... dentro do componente
	const submit = handleSubmit(onSubmit)

	function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault()

		if (isSubmitting) {
			return
		}

		if (!isEditing) {
			handleStartEdit()
			return
		}

		submit()
	}

	function handleStartEdit() {
		if (isSubmitting) {
			return
		}
		setIsEditing(true)
		requestAnimationFrame(() => setFocus("username"))
	}

	async function onSubmit(data: EditUsernameFormValues) {
		try {
			const result = await editUsernameAction(data)

			if (!result) {
				toast.error("Erro ao atualizar username", {
					description: "Resposta vazia do servidor. Tente novamente."
				})
				return
			}

			if (result.success) {
				clearReferralUrl()
				toast.success("Username atualizado", {
					description: result.message
				})
				setIsEditing(false)
				return
			}

			if (result.success === false) {
				if (result.code === "unauthenticated") {
					router.replace("/")
				}
			}

			toast.error("Não foi possivel atualizar", {
				description: result.message ?? "Verifique os dados e tente novamente."
			})
		} catch (error) {
			console.error("[editUsernameAction] erro inesperado:", error)
			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full">
			<Controller
				name="username"
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={inputId} className="sr-only">
							Username
						</FieldLabel>
						<InputGroup className="rounded-md border-0 bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground shadow-none">
							<InputGroupInput
								{...field}
								id={inputId}
								onChange={(event) => field.onChange(normalizeUsername(event.target.value))}
								readOnly={!isEditing || isSubmitting}
								aria-readonly={!isEditing}
								aria-invalid={fieldState.invalid}
								tabIndex={isEditing && !isSubmitting ? 0 : -1}
								disabled={isSubmitting}
								className={cn("h-auto p-0 text-xs text-foreground", !isEditing && "pointer-events-none text-muted-foreground")}
							/>
							<InputGroupAddon align="inline-end" className="pr-0">
								<InputGroupButton
									type="button"
									size="icon-xs"
									variant="ghost"
									aria-label={isSubmitting ? "Salvando username" : isEditing ? "Salvar username" : "Editar username"}
									onClick={handleClick}
									disabled={isSubmitting}
								>
									<span className="relative inline-flex h-4 w-4 items-center justify-center">
										{isSubmitting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<>
												<PencilLine className={cn("absolute h-4 w-4 transition-all duration-200", isEditing ? "scale-90 opacity-0" : "scale-100 opacity-100")} />
												<Check className={cn("absolute h-4 w-4 transition-all duration-200", isEditing ? "scale-100 opacity-100" : "scale-90 opacity-0")} />
											</>
										)}
									</span>
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</Field>
				)}
			/>
		</form>
	)
}
