"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { getPermissionPresentation } from "@/modules/auth/shared/permission-presenter"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { updateRolePermissionsAction } from "@/modules/organizations/memberships/server/slices/update-role-permissions/actions/update-role-permissions.action"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"

type RolePermission = {
	key: string
	description: string
}

type AvailablePermission = {
	key: string
	description: string
}

type OrganizationRoleWithPermissions = {
	id: string
	name: string
	isActive: boolean
	isSystem: boolean
	permissions: RolePermission[]
}

type RolesCardsProps = {
	roles: OrganizationRoleWithPermissions[]
	permissionsKeys: string[]
	availablePermissions: AvailablePermission[]
	isCurrentUserOwner: boolean
}

const PRIVILEGED_PERMISSION_SUFFIX = ".privileged"

const isOwnerRole = (roleName: string) => roleName.trim().toUpperCase() === "OWNER"
const isAdminRole = (roleName: string) => roleName.trim().toUpperCase() === "ADMIN"
const isPrivilegedPermission = (permissionKey: string) => permissionKey.endsWith(PRIVILEGED_PERMISSION_SUFFIX)

const areSetsEqual = (setA: Set<string>, setB: Set<string>) => {
	if (setA.size !== setB.size) {
		return false
	}

	for (const value of setA) {
		if (!setB.has(value)) {
			return false
		}
	}

	return true
}

const sortByLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })

const normalizePermissionKeys = (permissionKeys: string[]) => [...new Set(permissionKeys.map((permissionKey) => permissionKey.trim()).filter((permissionKey) => permissionKey.length > 0))]

export const RolesCards = ({ roles, permissionsKeys, availablePermissions, isCurrentUserOwner }: RolesCardsProps) => {
	const router = useRouter()
	const canEditRolePermissions = permissionsKeys.includes(PERMISSIONS.ROLES_UPDATE)

	const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)
	const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
	const [initialPermissionKeys, setInitialPermissionKeys] = useState<Set<string>>(new Set())
	const [draftPermissionKeys, setDraftPermissionKeys] = useState<Set<string>>(new Set())
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) ?? null, [roles, selectedRoleId])
	const selectedRoleIsOwner = selectedRole ? isOwnerRole(selectedRole.name) : false
	const selectedRoleIsAdmin = selectedRole ? isAdminRole(selectedRole.name) : false
	const canEditSelectedRole = Boolean(selectedRole) && canEditRolePermissions && !selectedRoleIsOwner && !(selectedRoleIsAdmin && !isCurrentUserOwner)
	const isDirty = useMemo(() => !areSetsEqual(initialPermissionKeys, draftPermissionKeys), [initialPermissionKeys, draftPermissionKeys])

	const selectedRolePermissionOptions = useMemo(() => {
		if (!selectedRole) {
			return []
		}

		return availablePermissions
			.filter((permission) => (selectedRoleIsOwner ? true : !isPrivilegedPermission(permission.key)))
			.map((permission) => ({
				permission,
				presentation: getPermissionPresentation(permission)
			}))
			.sort((a, b) => sortByLabel(a.presentation, b.presentation))
	}, [availablePermissions, selectedRole, selectedRoleIsOwner])

	function openRoleSheet(role: OrganizationRoleWithPermissions) {
		const rolePermissionKeys = normalizePermissionKeys(role.permissions.map((permission) => permission.key))
		const nextInitialPermissionKeys = new Set(rolePermissionKeys)
		const nextDraftPermissionKeys = new Set(rolePermissionKeys.filter((permissionKey) => (isOwnerRole(role.name) ? true : !isPrivilegedPermission(permissionKey))))

		setSelectedRoleId(role.id)
		setInitialPermissionKeys(nextInitialPermissionKeys)
		setDraftPermissionKeys(nextDraftPermissionKeys)
		setIsSubmitting(false)
		setIsSheetOpen(true)
	}

	function togglePermission(permissionKey: string, checked: boolean) {
		setDraftPermissionKeys((current) => {
			const next = new Set(current)

			if (checked) {
				next.add(permissionKey)
			} else {
				next.delete(permissionKey)
			}

			return next
		})
	}

	async function handleSavePermissions() {
		if (!selectedRole || !canEditSelectedRole || !isDirty || isSubmitting) {
			return
		}

		setIsSubmitting(true)
		const result = await updateRolePermissionsAction({
			roleId: selectedRole.id,
			permissionKeys: [...draftPermissionKeys].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
		})

		if (result.success) {
			toast.success("Permissões atualizadas", {
				description: result.message
			})
			setIsSheetOpen(false)
			router.refresh()
			setIsSubmitting(false)
			return
		}

		toast.error("Não foi possível atualizar", {
			description: result.message
		})
		setIsSubmitting(false)
	}

	return (
		<Sheet
			open={isSheetOpen}
			onOpenChange={(nextOpen) => {
				setIsSheetOpen(nextOpen)

				if (!nextOpen) {
					setSelectedRoleId(null)
					setInitialPermissionKeys(new Set())
					setDraftPermissionKeys(new Set())
					setIsSubmitting(false)
				}
			}}
		>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{roles.map((role) => (
					<Card key={role.id} className="h-full">
						<CardHeader className="space-y-2">
							<div className="flex items-center gap-2">
								<CardTitle>{role.name}</CardTitle>
								{role.isSystem ? <Badge variant="secondary">Sistema</Badge> : null}
							</div>
							<CardDescription>{role.permissions.length} permissões vinculadas.</CardDescription>
						</CardHeader>
						<CardContent className="flex-1">
							<ScrollArea className="h-20">
								<div className="flex flex-wrap gap-2 pr-3">
									{role.permissions
										.map((permission) => ({
											key: permission.key,
											label: getPermissionPresentation(permission).label
										}))
										.sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }))
										.map((permission) => (
											<Badge key={permission.key} variant="outline">
												{permission.label}
											</Badge>
										))}
								</div>
							</ScrollArea>
						</CardContent>
						<CardFooter>
							<Button variant="outline" onClick={() => openRoleSheet(role)}>
								Ver permissões
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>

			<SheetContent side="right" className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{selectedRole ? `Permissões: ${selectedRole.name}` : "Permissões do cargo"}</SheetTitle>
					<SheetDescription>
						{selectedRoleIsOwner
							? "O cargo OWNER é protegido e pode apenas ser visualizado."
							: selectedRoleIsAdmin && !isCurrentUserOwner
								? "Apenas OWNER pode editar permissões do cargo ADMIN."
								: canEditRolePermissions
									? "Marque ou desmarque as permissões e salve ao final."
									: "Você não possui permissão para editar cargos. Apenas visualização disponível."}
					</SheetDescription>
				</SheetHeader>
				<ScrollArea className="mt-6 h-[65vh] px-8">
					<div className="space-y-3">
						{selectedRolePermissionOptions.map(({ permission, presentation }) => (
							<Label key={permission.key} className="flex items-start gap-3 rounded-lg border p-3">
								<Checkbox
									checked={draftPermissionKeys.has(permission.key)}
									onCheckedChange={(checked) => togglePermission(permission.key, checked === true)}
									disabled={!canEditSelectedRole || isSubmitting}
									aria-label={`Permissão ${presentation.label}`}
								/>
								<div className="space-y-1">
									<p className="text-sm font-medium">{presentation.label}</p>
									<p className="text-xs text-muted-foreground">{presentation.description}</p>
									<p className="text-xs text-muted-foreground">Chave técnica: {presentation.technicalKey}</p>
								</div>
							</Label>
						))}

						{selectedRole && selectedRolePermissionOptions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma permissão disponível para este cargo.</p> : null}
					</div>
				</ScrollArea>

				{selectedRole && (
					<SheetFooter>
						<p className="mb-3 text-xs text-muted-foreground">
							{draftPermissionKeys.size} permissões selecionadas
							{isDirty ? " (alterações pendentes)." : "."}
						</p>
						<Button type="button" onClick={handleSavePermissions} disabled={!canEditSelectedRole || !isDirty || isSubmitting}>
							{isSubmitting ? "Salvando..." : "Salvar permissões"}
						</Button>
					</SheetFooter>
				)}
			</SheetContent>
		</Sheet>
	)
}
