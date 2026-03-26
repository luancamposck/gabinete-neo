"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { updateMembershipRoleAction } from "@/modules/organizations/memberships/server/slices/update-membership-role/actions/update-membership-role.action"
import type { OrganizationMemberTableRow, OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Combobox } from "@/shared/components/ui/combobox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet"

type MemberRoleChangeSheetProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	member: OrganizationMemberTableRow
	availableRoles: OrganizationRoleOption[]
	canAssignPrivilegedRoles: boolean
}

const normalizeRoleName = (value: string) => value.trim().toLowerCase()
const PRIVILEGED_ROLE_NAMES = new Set(["OWNER", "ADMIN"])

const isPrivilegedRole = (name: string) => PRIVILEGED_ROLE_NAMES.has(name.trim().toUpperCase())

function getRolePriority(name: string) {
	const normalized = normalizeRoleName(name)

	if (normalized === "owner") return 0
	if (normalized === "admin") return 1
	if (normalized === "member" || normalized === "membro") return 2
	return 3
}

export const RoleChangeSheet = ({ open, onOpenChange, member, availableRoles, canAssignPrivilegedRoles }: MemberRoleChangeSheetProps) => {
	const router = useRouter()

	const { name: memberDisplayName, id: memberUserId } = member.user
	const { id: currentRoleId, name: currentRoleName } = member.role

	const [selectedRoleId, setSelectedRoleId] = useState<string>(currentRoleId)
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

	const sortedRoles = useMemo(
		() =>
			[...availableRoles].sort((a, b) => {
				const priorityDiff = getRolePriority(a.name) - getRolePriority(b.name)
				if (priorityDiff !== 0) return priorityDiff
				return a.name.localeCompare(b.name, "pt-BR")
			}),
		[availableRoles]
	)

	const roleItems = useMemo(
		() =>
			sortedRoles.map((role) => ({
				value: role.id,
				label: role.name,
				disabled: role.id === currentRoleId || (!canAssignPrivilegedRoles && isPrivilegedRole(role.name))
			})),
		[sortedRoles, currentRoleId, canAssignPrivilegedRoles]
	)

	const selectedRole = useMemo(() => sortedRoles.find((role) => role.id === selectedRoleId) ?? null, [sortedRoles, selectedRoleId])
	const selectedRoleLabel = selectedRole?.name ?? null

	const currentRoleLabel = useMemo(() => sortedRoles.find((role) => role.id === currentRoleId)?.name ?? "Não definido", [sortedRoles, currentRoleId])

	const isSelectionChanged = selectedRoleId !== currentRoleId
	const isPrivilegedCurrentRole = isPrivilegedRole(currentRoleName)
	const isPrivilegedTargetRole = selectedRole ? isPrivilegedRole(selectedRole.name) : false
	const isPrivilegedOperation = isPrivilegedCurrentRole || isPrivilegedTargetRole
	const blockedByPrivilegedPolicy = isPrivilegedOperation && !canAssignPrivilegedRoles
	const canSave = Boolean(selectedRoleId) && isSelectionChanged && !blockedByPrivilegedPolicy

	async function handleSubmit() {
		if (!canSave || isSubmitting) return

		setIsSubmitting(true)
		const result = await updateMembershipRoleAction({
			memberUserId,
			roleId: selectedRoleId
		})

		if (result.success) {
			toast.success("Cargo atualizado", {
				description: result.message
			})
			onOpenChange(false)
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
			open={open}
			onOpenChange={(nextOpen) => {
				if (nextOpen) {
					setSelectedRoleId(currentRoleId)
					setIsSubmitting(false)
				}
				onOpenChange(nextOpen)
			}}
		>
			<SheetContent side="right" className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Mudar Cargo</SheetTitle>
					<SheetDescription>
						Atualize o cargo de <span className="font-medium">{memberDisplayName}</span>.
					</SheetDescription>
				</SheetHeader>

				<div className="space-y-4 p-6">
					<div className="space-y-2">
						<p className="text-sm text-muted-foreground">Selecione o novo cargo desejado:</p>
						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground">Cargo atual:</span>
							<Badge variant="outline">{currentRoleLabel}</Badge>
						</div>
					</div>

					{roleItems.length === 0 ? (
						<p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Nenhum cargo disponível para alteração.</p>
					) : (
						<div className="space-y-2">
							<p className="text-sm font-medium">Novo cargo</p>
							<Combobox
								items={roleItems}
								value={selectedRoleId}
								onValueChange={setSelectedRoleId}
								placeholder="Selecione o novo cargo"
								searchPlaceholder="Buscar cargo..."
								emptyMessage="Nenhum cargo encontrado."
								disabled={isSubmitting}
							/>
							{selectedRoleLabel && (
								<p className="text-xs text-muted-foreground">
									Selecionado: <span className="font-medium text-foreground">{selectedRoleLabel}</span>
								</p>
							)}
							{blockedByPrivilegedPolicy && <p className="text-xs text-amber-600">Alteração de cargos privilegiados requer permissão adicional.</p>}
						</div>
					)}

					<div className="pt-2">
						<Button type="button" disabled={!canSave || isSubmitting} onClick={handleSubmit}>
							{isSubmitting ? "Salvando..." : "Salvar alteração"}
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
