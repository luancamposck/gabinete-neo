// @/modules/app-shell/server/slices/get-sidebar-context/actions/get-sidebar-context.action.ts
"use server"

import { getSidebarContextUseCase } from "@/modules/app-shell/server/slices/get-sidebar-context/use-cases/get-sidebar-context.use-case"

export async function getSidebarContextAction() {
	return getSidebarContextUseCase()
}
