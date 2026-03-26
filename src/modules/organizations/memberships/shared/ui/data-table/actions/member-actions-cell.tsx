"use client"

import { Eye, ShieldUser, ToggleLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import type { PermissionKey } from "@/modules/auth/shared/permissions"
import { updateMembershipStatusAction } from "@/modules/organizations/memberships/server/slices/update-membership-status/actions/update-membership-status.action"
import type { OrganizationMemberTableRow, OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import { DetailsSheet } from "@/modules/organizations/memberships/shared/ui/data-table/sheets/details-sheet"
import { RoleChangeSheet } from "@/modules/organizations/memberships/shared/ui/data-table/sheets/role-change-sheet"

type MemberActionsCellProps = {
	member: OrganizationMemberTableRow
	permissionsKeys: PermissionKey[]
	availableRoles: OrganizationRoleOption[]
}

export const MemberActionsCell = ({ member, permissionsKeys, availableRoles }: MemberActionsCellProps) => {
	const router = useRouter()
	const permissionsSet = useMemo(() => new Set(permissionsKeys), [permissionsKeys])

	// Permissão base para abrir o fluxo de mudança de cargo.
	const canManageMemberRoles = permissionsSet.has("org.membership.role.update")
	// Permissão extra para operações de cargo envolvendo OWNER/ADMIN.
	const canManageMemberRolePrivileged = permissionsSet.has("org.membership.role.update.privileged")

	// Permissão base para ativar/inativar membros não privilegiados.
	const canManageMemberStatus = permissionsSet.has("org.membership.status.update")
	// Permissão que também permite alterar status de OWNER/ADMIN.
	const canManageMemberStatusPrivileged = permissionsSet.has("org.membership.status.update.privileged")

	// Identifica se o membro alvo está em role privilegiada.
	const isTargetPrivilegedRole = ["OWNER", "ADMIN"].includes(member.role.name.toUpperCase())
	// Exibe botão de cargo se houver permissão base e, quando necessário, a privilegiada.
	const canShowRoleChange = canManageMemberRoles && (canManageMemberRolePrivileged || !isTargetPrivilegedRole)
	// Para membro comum, qualquer uma das permissões de status habilita o toggle.
	const canToggleNonPrivilegedStatus = canManageMemberStatus || canManageMemberStatusPrivileged
	// Para OWNER/ADMIN, só mostra toggle se tiver permissão de status privilegiada.
	const canShowStatusToggle = isTargetPrivilegedRole ? canManageMemberStatusPrivileged : canToggleNonPrivilegedStatus

	// Controle de Sheets
	const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState<boolean>(false)
	const [isRoleChangeSheetOpen, setIsRoleChangeSheetOpen] = useState<boolean>(false)

	// Controle de submit de status
	const [isStatusSubmitting, setIsStatusSubmitting] = useState<boolean>(false)

	async function handleToggleMemberStatus() {
		if (isStatusSubmitting) return

		setIsStatusSubmitting(true)
		const result = await updateMembershipStatusAction({
			memberUserId: member.user.id,
			isActive: !member.isActive
		})

		if (result.success) {
			toast.success("Status atualizado", {
				description: result.message
			})
			router.refresh()
			setIsStatusSubmitting(false)
			return
		}

		toast.error("Não foi possível atualizar", {
			description: result.message
		})
		setIsStatusSubmitting(false)
	}

	return (
		<>
			<DetailsSheet member={member} open={isDetailsSheetOpen} onOpenChange={setIsDetailsSheetOpen} />
			<RoleChangeSheet open={isRoleChangeSheetOpen} onOpenChange={setIsRoleChangeSheetOpen} member={member} canAssignPrivilegedRoles={canManageMemberRolePrivileged} availableRoles={availableRoles} />

			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon" className="size-8 p-0" aria-label="Visualizar usuário" onClick={() => setIsDetailsSheetOpen(true)}>
					<Eye className="size-4" />
				</Button>

				{canShowRoleChange && (
					<Button variant="ghost" size="icon" className="size-8 p-0" aria-label="Alterar cargo do usuário" onClick={() => setIsRoleChangeSheetOpen(true)}>
						<ShieldUser className="size-4" />
					</Button>
				)}

				{canShowStatusToggle && (
					<Button variant="ghost" size="icon" className="size-8 p-0" aria-label="Alterar status do usuário" onClick={handleToggleMemberStatus} disabled={isStatusSubmitting}>
						<ToggleLeft className={cn("size-4", member.isActive && "rotate-180 text-destructive")} />
					</Button>
				)}
			</div>
		</>
	)
}
