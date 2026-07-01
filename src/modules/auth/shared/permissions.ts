export const PERMISSIONS = {
	ORG_ADMIN_READ: "org.admin.read",
	ORG_ADMIN_UPDATE: "org.admin.update",
	USERS_READ: "users.read",
	ROLES_READ: "roles.read",
	ROLES_UPDATE: "roles.update",
	ORG_MEMBERSHIP_ROLE_UPDATE: "org.membership.role.update",
	ORG_MEMBERSHIP_ROLE_UPDATE_PRIVILEGED: "org.membership.role.update.privileged",
	ORG_MEMBERSHIP_STATUS_UPDATE: "org.membership.status.update",
	ORG_MEMBERSHIP_STATUS_UPDATE_PRIVILEGED: "org.membership.status.update.privileged",
	ORG_ROLES_READ: "roles.read",
	FLEET_APPLICATIONS_MANAGE: "fleet.applications.manage"
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
