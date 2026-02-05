export const PERMISSIONS = {
	ORG_ADMIN_READ: "org.admin.read",
	ORG_ADMIN_UPDATE: "org.admin.update"
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
