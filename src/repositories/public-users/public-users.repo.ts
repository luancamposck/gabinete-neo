// src/repositories/public-users/public-users.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { PublicUserUpdate } from "@/types/domain/users/user-base.types"

export async function updatePublicUserRepo({ userId, update }: { userId: string; update: PublicUserUpdate }): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabase = await createClient()

	return supabase.from("users").update(update).eq("id", userId).select("id").single()
}

export async function findUserWithProfileByUserIdRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase
		.from("users")
		.select(
			`
      id,
      name,
      email,
      created_at,
      profile:user_profiles!user_profiles_user_id_fkey (
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state
      )
    `
		)
		.eq("id", userId)
		.maybeSingle()
}

export async function getUserWithProfileByUserIdRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase
		.from("users")
		.select(
			`
      id,
      name,
      email,
      created_at,
      profile:user_profiles!user_profiles_user_id_fkey (
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state
      )
    `
		)
		.eq("id", userId)
		.single()
}
