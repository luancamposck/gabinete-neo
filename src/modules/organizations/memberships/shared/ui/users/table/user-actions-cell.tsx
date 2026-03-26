"use client"

import type { PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import type { OrganizationUserTableRow } from "@/modules/organizations/memberships/shared/types/organization-users-table.types"
import { UserRoleActionButton } from "@/modules/organizations/memberships/shared/ui/users/actions/user-role-action-button"
import { UserStatusActionButton } from "@/modules/organizations/memberships/shared/ui/users/actions/user-status-action-button"

type UserActionsCellProps = {
	user: OrganizationUserTableRow
	permissionKeys: PermissionKey[]
	availableRoles: OrganizationRoleOption[]
}

export const UserActionsCell = ({ user, permissionKeys, availableRoles }: UserActionsCellProps) => {
	return (
		<div className="flex items-center justify-end gap-1">
			<UserRoleActionButton user={user} permissionKeys={permissionKeys} availableRoles={availableRoles} iconOnly />
			<UserStatusActionButton user={user} permissionKeys={permissionKeys} iconOnly />
		</div>
	)
}
