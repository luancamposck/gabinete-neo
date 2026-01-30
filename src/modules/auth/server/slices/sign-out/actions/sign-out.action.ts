// @/modules/auth/server/slices/sign-out/actions/sign-out.action.ts
"use server"

import { revalidatePath } from "next/cache"

import { signOutService } from "@/modules/auth/server/services/sign-out.service"

export async function signOutAction() {
	const signOutRes = await signOutService()

	if (signOutRes.success === false) signOutRes

	revalidatePath("/", "layout")

	return signOutRes
}
