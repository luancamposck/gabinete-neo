// @/modules/organizations/shared/ui/edit-organization-field-form.tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Check, FileText, Loader2, PencilLine, Type } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { Field, FieldError } from "@/components/ui/field"
import { InputGroup, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group"
import { cn } from "@/lib/utils/cn"
import { updateCurrentOrganizationAction } from "@/modules/organizations/server/slices/update-current-organization/actions/update-current-organization.action"
import type { OrganizationDTO } from "@/modules/organizations/shared/types/dto"
import { useOrganizationConfig } from "@/modules/organizations/shared/ui/organization-config.context"
import { editOrganizationFieldsSchema } from "@/modules/organizations/shared/validations/edit-organization.schema"
import { Button } from "@/shared/components/ui/button"

type EditOrganizationFieldFormProps = {
	organization: OrganizationDTO
}

const NAME_HELP_TEXT = "Esse é o nome principal da sua constelação. Ele aparece no topo do dashboard, página de login, links de convite e ajuda as pessoas a reconhecerem sua constelação."
const DESCRIPTION_HELP_TEXT = "Um texto curto que explica do que se trata sua constelação. Ele aparece como descrição ao compartilhar o link de convite."
const EMPTY_DESCRIPTION_TEXT = "Sua constelação está sem descrição, adicione uma para ajudar as pessoas a se identificarem com você."

type EditOrganizationFormValues = z.infer<typeof editOrganizationFieldsSchema>

export const EditOrganizationFieldForm = ({ organization }: EditOrganizationFieldFormProps) => {
	const router = useRouter()

	const baseId = useId()
	const nameId = `${baseId}-organization-name`
	const descriptionId = `${baseId}-organization-description`
	const [isEditing, setIsEditing] = useState(false)

	const { setName, setDescription } = useOrganizationConfig()

	const form = useForm<EditOrganizationFormValues>({
		resolver: zodResolver(editOrganizationFieldsSchema),
		defaultValues: {
			name: organization.name ?? "",
			description: organization.description ?? ""
		}
	})

	const { control, handleSubmit, formState, setFocus } = form
	const isSubmitting = formState.isSubmitting

	const nameValue = useWatch({ control, name: "name" })
	const descriptionValue = useWatch({ control, name: "description" })

	// When this form mounts (or receives new props), sync context with the current org values.
	useEffect(() => {
		setName(organization.name ?? "")
		setDescription(organization.description)
	}, [organization.name, organization.description, setName, setDescription])

	// While the user types, keep the preview in sync.
	useEffect(() => {
		if (typeof nameValue !== "string") return
		setName(nameValue)
	}, [nameValue, setName])

	useEffect(() => {
		if (typeof descriptionValue !== "string") {
			setDescription(null)
			return
		}

		const normalized = descriptionValue.trim()
		setDescription(normalized.length > 0 ? descriptionValue : null)
	}, [descriptionValue, setDescription])

	const submit = handleSubmit(handleFormSubmit)

	function handleStartEdit() {
		if (isSubmitting) return
		setIsEditing(true)
		requestAnimationFrame(() => setFocus("name"))
	}

	function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault()

		if (isSubmitting) return

		if (!isEditing) {
			handleStartEdit()
			return
		}

		submit()
	}

	async function handleFormSubmit(data: EditOrganizationFormValues) {
		const updateRes = await updateCurrentOrganizationAction({
			organization: {
				...organization,
				name: data.name,
				// Action normalizes empty strings to `null` before reaching the use-case.
				description: data.description
			}
		})

		if (updateRes.success === false) {
			switch (updateRes.code) {
				case "unauthenticated": {
					router.replace("/")
					return
				}

				case "org_not_found": {
					router.replace("/tenant-not-found")
					return
				}

				case "not_allowed": {
					setIsEditing(false)
					form.reset({
						name: organization.name ?? "",
						description: organization.description ?? ""
					})
					toast.error("Não foi possível atualizar", {
						description: updateRes.message
					})
					return
				}

				default: {
					// deixa o error boundary do /dashboard lidar
					throw new Error(updateRes.message)
				}
			}
		}

		setIsEditing(false)
	}

	return (
		<section className="space-y-4">
			<div className="rounded-lg border bg-card p-4 shadow-sm">
				<div className="flex flex-col md:flex-row justify-center items-center md:justify-between gap-2">
					<div className="flex flex-col md:flex-row items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
							<Building2 className="h-4 w-4 text-primary" />
						</div>
						<div>
							<div className="text-sm font-semibold">Identidade da constelação</div>
							<div className="text-xs text-muted-foreground">Campos que definem como sua constelação aparece no layout e em links de convite.</div>
						</div>
					</div>

					<Button type="button" variant="ghost" size="icon" aria-label={isEditing ? "Salvar" : "Editar"} onClick={handleClick} disabled={isSubmitting}>
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
					</Button>
				</div>

				<div className="mt-4 text-sm">
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide flex items-center gap-2">
										<Type className="h-3.5 w-3.5" />
										Título da constelação
									</div>
									<InputGroup className="rounded-md border-0 bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground shadow-none">
										<InputGroupInput
											{...field}
											id={nameId}
											readOnly={!isEditing || isSubmitting}
											aria-readonly={!isEditing}
											tabIndex={isEditing && !isSubmitting ? 0 : -1}
											disabled={isSubmitting}
											className={cn("h-auto p-0 text-sm text-foreground", !isEditing && "pointer-events-none text-muted-foreground", isSubmitting && "animate-pulse")}
										/>
									</InputGroup>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									<p className="text-xs text-muted-foreground">{NAME_HELP_TEXT}</p>
								</Field>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className="space-y-1">
									<div className="text-[11px] font-medium uppercase tracking-wide flex items-center gap-2">
										<FileText className="h-3.5 w-3.5" />
										Descrição da constelação
									</div>
									<InputGroup className="rounded-md border-0 bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground shadow-none">
										<InputGroupTextarea
											{...field}
											id={descriptionId}
											rows={3}
											readOnly={!isEditing || isSubmitting}
											aria-readonly={!isEditing}
											tabIndex={isEditing && !isSubmitting ? 0 : -1}
											disabled={isSubmitting}
											placeholder={EMPTY_DESCRIPTION_TEXT}
											className={cn("h-auto p-0 text-sm text-foreground", !isEditing && "pointer-events-none text-muted-foreground", isSubmitting && "animate-pulse")}
										/>
									</InputGroup>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									<p className="text-xs text-muted-foreground">{DESCRIPTION_HELP_TEXT}</p>
								</Field>
							)}
						/>
					</form>
				</div>
			</div>
		</section>
	)
}
