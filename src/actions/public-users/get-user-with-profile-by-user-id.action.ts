"use server"

import { getUserWithProfileByUserIdService } from "@/services/users/get-user-with-profile-by-user-id.service"

async function getUserWithProfileByUserIdAction({ userId }: { userId: string }) {
	return getUserWithProfileByUserIdService({ userId })
}

export default getUserWithProfileByUserIdAction
