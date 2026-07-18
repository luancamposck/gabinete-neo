import { createClient as _createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/supabase"

// Este cliente é para uso exclusivo em Server Actions e rotas de API
// que precisam realizar operações com privilégios de administrador,
// ignorando as políticas de RLS. Ele utiliza a SECRET_KEY.
// NUNCA deve ser usado em componentes de cliente ou onde a identidade
// do usuário logado é necessária para a lógica de RLS.

export function createAdminClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

	if (!supabaseUrl || !supabaseSecretKey) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variable")
	}

	return _createClient<Database>(supabaseUrl, supabaseSecretKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	})
}
