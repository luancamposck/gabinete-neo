// @/modules/app-shell/server/slices/get-sidebar-context/actions/get-sidebar-context.action.ts
"use server"

import { getSidebarContextUseCase } from "@/modules/app-shell/server/slices/get-sidebar-context/use-cases/get-sidebar-context.use-case"
import type { PermissionKey } from "@/modules/auth/shared/permissions"

export async function getSidebarContextAction({ permissionKey }: { permissionKey: PermissionKey }) {
	return getSidebarContextUseCase({ permissionKey })
}
