import { createClient as _createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/supabase"

// Este cliente é para uso exclusivo em Server Actions e rotas de API
// que precisam realizar operações com privilégios de administrador,
// ignorando as políticas de RLS. Ele utiliza a SERVICE_ROLE_KEY.
// NUNCA deve ser usado em componentes de cliente ou onde a identidade
// do usuário logado é necessária para a lógica de RLS.

export function createAdminClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!supabaseUrl || !supabaseServiceRoleKey) {
		throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable")
	}

	return _createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	})
}
