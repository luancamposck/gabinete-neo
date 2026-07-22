// @/modules/auth/server/repos/create-user.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { CreateUserAdminRepoParams } from "../../shared/types/slices/create-user.types"

export async function createUserAdminRepo(params: CreateUserAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.auth.admin.createUser({
		email: params.email,
		password: params.password,
		email_confirm: true,
		user_metadata: {
			name: params.name,
			username: params.username,
			phone: params.phone,
			cep: params.cep,
			street: params.street,
			number: params.number,
			complement: params.complement ?? null,
			neighborhood: params.neighborhood,
			city: params.city,
			state: params.state
		}
	})
}
