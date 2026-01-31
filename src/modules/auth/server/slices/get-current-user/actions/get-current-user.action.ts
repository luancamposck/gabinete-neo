// @/modules/auth/server/slives/get-current-auth-user/actions/get-current-auth-user.action.ts

"use server"

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"

export async function getCurrentUserAction() {
	return getCurrentAuthUserService()
}
