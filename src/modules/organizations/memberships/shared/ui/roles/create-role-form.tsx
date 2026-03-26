"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getPermissionPresentation } from "@/modules/auth/shared/permission-presenter"
import { createRoleAction } from "@/modules/organizations/memberships/server/slices/create-role/actions/create-role.action"
import { type CreateRoleSchemaClientData, createRoleSchemaClient } from "@/modules/organizations/memberships/shared/validations/create-role.schema"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"

const defaultValues: CreateRoleSchemaClientData = {
	name: "",
	permissions: []
}

type AvailablePermission = {
	id: string
	key: string
	description: string
}

type CreateRoleFormProps = {
	availablePermissions: AvailablePermission[]
}

export const CreateRoleForm = ({ availablePermissions }: CreateRoleFormProps) => {
	const baseId = useId()
	const formId = `${baseId}-create-role-form`
	const roleNameId = `${baseId}-role-name`
	const router = useRouter()

	const createRoleFormSchema = useMemo(() => createRoleSchemaClient(availablePermissions.map((permission) => permission.key)), [availablePermissions])

	const permissionItems = useMemo(
		() =>
			availablePermissions
				.map((permission) => ({
					id: permission.id,
					key: permission.key,
					presentation: getPermissionPresentation(permission)
				}))
				.sort((a, b) => a.presentation.label.localeCompare(b.presentation.label, "pt-BR", { sensitivity: "base" })),
		[availablePermissions]
	)

	const form = useForm<CreateRoleSchemaClientData>({
		resolver: zodResolver(createRoleFormSchema),
		defaultValues
	})

	const { clearErrors, control, handleSubmit, formState, reset, setError, watch } = form
	const selectedPermissions = watch("permissions")
	const selectedCount = selectedPermissions.length

	async function onSubmit(values: CreateRoleSchemaClientData) {
		clearErrors(["name", "permissions"])

		try {
			const result = await createRoleAction({
				name: values.name,
				permissionKeys: values.permissions
			})

			if (result.success) {
				toast.success("Cargo criado com sucesso", {
					description: result.message
				})

				reset(defaultValues)
				return
			}

			switch (result.code) {
				case "unauthenticated": {
					return router.replace("/")
				}

				case "org_not_found": {
					return router.replace("/tenant-not-found")
				}

				case "role_name_conflict":
				case "invalid_role_name": {
					setError("name", {
						type: "server",
						message: result.message
					})
					return
				}

				case "invalid_permissions": {
					setError("permissions", {
						type: "server",
						message: result.message
					})
					return
				}

				case "forbidden":
				case "infra_error": {
					toast.error("Não foi possível criar o cargo", {
						description: result.message
					})
					return
				}

				default: {
					toast.error("Não foi possível criar o cargo", {
						description: result.message
					})
				}
			}
		} catch (error) {
			toast.error("Erro inesperado", {
				description: error instanceof Error ? error.message : "Tente novamente em alguns instantes."
			})
		}
	}

	return (
		<Card className="max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle>Novo cargo</CardTitle>
				<CardDescription>Defina o nome do cargo e selecione as permissões que ele terá (opcional).</CardDescription>
			</CardHeader>

			<CardContent>
				<form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
					<FieldSet>
						<FieldGroup>
							<Controller
								name="name"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={roleNameId}>Nome do cargo</FieldLabel>
										<Input {...field} id={roleNameId} placeholder="Ex.: Coordenador de operações" aria-invalid={fieldState.invalid} disabled={formState.isSubmitting} />
										<FieldDescription>Esse nome será exibido para os membros da organização.</FieldDescription>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>

							<Controller
								name="permissions"
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<div className="flex items-center justify-between gap-2">
											<FieldLabel>Permissões do cargo</FieldLabel>
											<Badge variant={selectedCount > 0 ? "default" : "secondary"}>
												{selectedCount} selecionada{selectedCount === 1 ? "" : "s"}
											</Badge>
										</div>
										<FieldDescription>Selecione as permissões habilitadas para este cargo. Você pode deixar tudo desmarcado.</FieldDescription>

										<div className="grid gap-3 md:grid-cols-2">
											{permissionItems.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma permissão disponível para este tenant.</p> : null}

											{permissionItems.map((permission) => {
												const permissionInputId = `${baseId}-permission-${permission.key.replace(/\./g, "-")}`
												const isChecked = field.value.includes(permission.key)

												return (
													<label key={permission.id} htmlFor={permissionInputId} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-3 py-3 transition-colors hover:bg-accent/40">
														<Checkbox
															id={permissionInputId}
															checked={isChecked}
															disabled={formState.isSubmitting}
															onCheckedChange={(checked) => {
																const currentPermissions = field.value

																if (checked === true) {
																	if (!currentPermissions.includes(permission.key)) {
																		field.onChange([...currentPermissions, permission.key])
																	}
																	return
																}

																field.onChange(currentPermissions.filter((permissionKey) => permissionKey !== permission.key))
															}}
														/>

														<div className="space-y-1">
															<p className="text-sm font-medium leading-tight">{permission.presentation.label}</p>
															<p className="text-xs text-muted-foreground">{permission.presentation.description}</p>
															<p className="text-[11px] text-muted-foreground">Chave técnica: {permission.presentation.technicalKey}</p>
														</div>
													</label>
												)
											})}
										</div>

										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>
						</FieldGroup>
					</FieldSet>
				</form>
			</CardContent>

			<CardFooter className="justify-end gap-2">
				<Button type="button" variant="outline" onClick={() => reset(defaultValues)} disabled={formState.isSubmitting}>
					Limpar
				</Button>
				<Button type="submit" form={formId} disabled={formState.isSubmitting}>
					<Save className="mr-2 size-4" />
					{formState.isSubmitting ? "Salvando..." : "Salvar cargo"}
				</Button>
			</CardFooter>
		</Card>
	)
}
