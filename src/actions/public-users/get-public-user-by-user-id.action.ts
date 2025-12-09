"use server"

import { getPublicUserByUserIdService } from "@/services/users/get-public-user-by-user-id.service"

async function getPublicUserByUserIdAction({ userId }: { userId: string }) {
	return getPublicUserByUserIdService({ userId })
}

export default getPublicUserByUserIdAction
