// @/modules/accounts/users/profiles/server/repos/update-address.repo.ts
import { createClient } from "@/lib/supabase/server"
import type { UserProfileUpdate } from "@/modules/accounts/users/profiles/shared/types/db"

type UpdateAddressRepoParams = {
	userId: string
	address: UserProfileUpdate
}

export async function updateUserAddressRepo({ userId, address }: UpdateAddressRepoParams) {
	const supabase = await createClient()

	return supabase.from("user_profiles").update(address).eq("user_id", userId).select("user_id").single()
}
