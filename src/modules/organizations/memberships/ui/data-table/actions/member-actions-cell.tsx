"use client"

import { ArrowRightLeft, Eye, Settings, ToggleLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { updateMembershipStatusAction } from "@/modules/organizations/memberships/server/slices/update-membership-status/actions/update-membership-status.action"
import type { OrganizationMemberTableRow, OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import { DetailsSheet } from "@/modules/organizations/memberships/ui/data-table/sheets/details-sheet"
import { RoleChangeSheet } from "@/modules/organizations/memberships/ui/data-table/sheets/role-change-sheet"

type MemberActionsCellProps = {
	member: OrganizationMemberTableRow
	permissionsKeys: string[]
	availableRoles: OrganizationRoleOption[]
}

export const MemberActionsCell = ({ member, permissionsKeys, availableRoles }: MemberActionsCellProps) => {
	const router = useRouter()
	const permissionsSet = useMemo(() => new Set(permissionsKeys), [permissionsKeys])

	// Controle de Roles
	const canManageMemberRoles = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE)
	const canManageMemberRolePrivileged = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE_PRIVILEGED)

	// Constrole de Status
	const canManageMemberStatus = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_STATUS_UPDATE)
	const canManageMemberStatusPrivileged = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_STATUS_UPDATE_PRIVILEGED)

	// Controle de UI
	const isTargetPrivilegedRole = ["OWNER", "ADMIN"].includes(member.role.name.toUpperCase())
	const canShowRoleChange = canManageMemberRoles && (canManageMemberRolePrivileged || !isTargetPrivilegedRole)
	const canToggleNonPrivilegedStatus = canManageMemberStatus || canManageMemberStatusPrivileged
	const canShowStatusToggle = isTargetPrivilegedRole ? canManageMemberStatusPrivileged : canToggleNonPrivilegedStatus
	const canShowSettingsMenu = canShowRoleChange || canShowStatusToggle

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
			<RoleChangeSheet
				open={isRoleChangeSheetOpen}
				onOpenChange={setIsRoleChangeSheetOpen}
				member={member}
				canAssignPrivilegedRoles={canManageMemberRolePrivileged}
				availableRoles={availableRoles}
			/>

			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon" className="size-8 p-0" aria-label="Visualizar usuário" onClick={() => setIsDetailsSheetOpen(true)}>
					<Eye className="size-4" />
				</Button>

				{canShowSettingsMenu && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-8 p-0" aria-label="Abrir ações de configuração" disabled={isStatusSubmitting}>
								<Settings className="size-4" />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-44">
							{canShowRoleChange && (
								<DropdownMenuItem onSelect={() => setIsRoleChangeSheetOpen(true)}>
									<ArrowRightLeft />
									Mudar Cargo
								</DropdownMenuItem>
							)}

							{canShowRoleChange && canShowStatusToggle && <DropdownMenuSeparator />}

							{canShowStatusToggle && (
								<DropdownMenuItem variant={member.isActive ? "destructive" : "default"} onSelect={handleToggleMemberStatus}>
									<ToggleLeft />
									{member.isActive ? "Inativar membro" : "Ativar membro"}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</>
	)
}
