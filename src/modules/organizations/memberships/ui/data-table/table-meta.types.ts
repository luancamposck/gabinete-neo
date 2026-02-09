import type { OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"

export type MembersTableMeta = {
	permissionsKeys: string[]
	availableRoles: OrganizationRoleOption[]
}
