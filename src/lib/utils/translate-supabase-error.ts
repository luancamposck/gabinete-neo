const SUPABASE_ERROR_MAP: Record<string, string> = {
  "23505": "Registro duplicado. Este dado já existe.",
  "42501": "Permissão negada.",
  PGRST116: "Recurso não encontrado.",
  PGRST301: "Erro de autenticação.",
  "22P02": "Formato de dado inválido.",
  "23503": "Violação de integridade referencial.",
  PGRST204: "Requisição inválida."
}

function translateSupabaseError(code?: string, fallback?: string): string {
  if (!code) return fallback ?? "Ocorreu um erro inesperado. Tente novamente."
  return (
    SUPABASE_ERROR_MAP[code] ??
    fallback ??
    "Ocorreu um erro inesperado. Tente novamente."
  )
}

export default translateSupabaseError
