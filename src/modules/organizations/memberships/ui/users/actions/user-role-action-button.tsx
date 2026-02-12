"use client"

import { ShieldUser } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { PERMISSIONS, type PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationMemberTableRow, OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import type { OrganizationUserTableRow } from "@/modules/organizations/memberships/shared/types/organization-users-table.types"
import { RoleChangeSheet } from "@/modules/organizations/memberships/ui/data-table/sheets/role-change-sheet"

type UserRoleActionButtonProps = {
	user: OrganizationUserTableRow
	permissionKeys: PermissionKey[]
	availableRoles: OrganizationRoleOption[]
	iconOnly?: boolean
}

export const canShowUserRoleAction = (params: { permissionKeys: PermissionKey[]; roleName: string }) => {
	const permissionsSet = new Set(params.permissionKeys)
	const canManageMemberRoles = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE)
	const canManageMemberRolePrivileged = permissionsSet.has(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE_PRIVILEGED)
	const isTargetPrivilegedRole = ["OWNER", "ADMIN"].includes(params.roleName.toUpperCase())

	return canManageMemberRoles && (canManageMemberRolePrivileged || !isTargetPrivilegedRole)
}

const mapUserRowToMemberTableRow = (user: OrganizationUserTableRow): OrganizationMemberTableRow => ({
	organizationId: user.organizationId,
	role: user.role,
	isActive: user.isActive,
	joinedAt: user.joinedAt,
	invitedByUserName: user.invitedByUserName,
	relationshipToInviter: user.relationshipToInviter,
	user: user.user
})

export const UserRoleActionButton = ({ user, permissionKeys, availableRoles, iconOnly = false }: UserRoleActionButtonProps) => {
	const [isRoleChangeSheetOpen, setIsRoleChangeSheetOpen] = useState(false)

	const canShowRoleChange = useMemo(() => canShowUserRoleAction({ permissionKeys, roleName: user.role.name }), [permissionKeys, user.role.name])
	const canAssignPrivilegedRoles = useMemo(() => permissionKeys.includes(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE_PRIVILEGED), [permissionKeys])
	const member = useMemo(() => mapUserRowToMemberTableRow(user), [user])

	if (!canShowRoleChange) {
		return null
	}

	return (
		<>
			<RoleChangeSheet open={isRoleChangeSheetOpen} onOpenChange={setIsRoleChangeSheetOpen} member={member} canAssignPrivilegedRoles={canAssignPrivilegedRoles} availableRoles={availableRoles} />
			{iconOnly ? (
				<Button variant="ghost" size="icon" className="size-8 p-0" aria-label="Alterar cargo do usuário" onClick={() => setIsRoleChangeSheetOpen(true)}>
					<ShieldUser className="size-4" />
				</Button>
			) : (
				<Button type="button" variant="outline" onClick={() => setIsRoleChangeSheetOpen(true)} className="w-full">
					Mudar cargo
				</Button>
			)}
		</>
	)
}
