"use server"

import { getCurrentAuthUserService } from "@/services/auth/get-current-auth-user.service"

export async function getCurrentAuthUserAction() {
	return getCurrentAuthUserService()
}
