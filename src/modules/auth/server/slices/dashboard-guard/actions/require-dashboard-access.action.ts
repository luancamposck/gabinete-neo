// @/modules/auth/server/slices/dashboard-guard/actions/require-dashboard-acess.action.ts
"use server"

import { requireDashboardAccessUseCase } from "@/modules/auth/server/slices/dashboard-guard/use-cases/require-dashboard-access.use-case"

export async function requireDashboardAccessAction() {
	return requireDashboardAccessUseCase()
}
