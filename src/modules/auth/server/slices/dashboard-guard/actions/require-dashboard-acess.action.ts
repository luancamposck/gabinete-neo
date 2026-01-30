"use server"

import { requireDashboardAccessUseCase } from "../use-cases/require-dashboard-access.use-case"

export async function requireDashboardAccessAction() {
	return requireDashboardAccessUseCase()
}
