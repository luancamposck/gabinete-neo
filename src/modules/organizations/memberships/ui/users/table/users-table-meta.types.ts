import type { PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"

export type UsersTableMeta = {
	permissionKeys: PermissionKey[]
	availableRoles: OrganizationRoleOption[]
}
