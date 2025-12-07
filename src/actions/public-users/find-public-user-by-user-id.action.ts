"use server"

import { findPublicUserByUserIdService } from "@/services/users/find-public-user-by-user-id.service"

async function findPublicUserByUserIdAction({ userId }: { userId: string }) {
	return findPublicUserByUserIdService({ userId })
}

export default findPublicUserByUserIdAction
