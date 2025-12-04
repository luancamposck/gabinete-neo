-- =====================================================================
-- Migration: alter_user_profiles_remove_cpf_add_unique_phone
-- Objetivo:
--   - Remover coluna cpf de public.user_profiles
--   - Remover unicidade baseada em cpf
--   - Tornar phone único (e opcionalmente NOT NULL)
-- =====================================================================

-- 0) Verificar se existem telefones duplicados
--    Se houver, a migration vai falhar com erro explícito.
DO $$
BEGIN
  IF EXISTS (
    SELECT phone
    FROM public.user_profiles
    WHERE phone IS NOT NULL
    GROUP BY phone
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Não é possível criar UNIQUE em phone: existem telefones duplicados em public.user_profiles.';
  END IF;
END;
$$;

-- 1) Remover constraint/índice UNIQUE de cpf (nome padrão do Postgres: user_profiles_cpf_key)
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_cpf_key;

-- Se em alguma migration antiga você criou um índice unique separado, algo como:
-- DROP INDEX IF EXISTS user_profiles_cpf_idx;

-- 2) Remover coluna cpf
ALTER TABLE public.user_profiles
  DROP COLUMN IF EXISTS cpf;

-- 3) (Opcional) garantir que phone seja NOT NULL
--    Só faça isso se fizer sentido pra sua regra de negócio.
ALTER TABLE public.user_profiles
  ALTER COLUMN phone SET NOT NULL;

-- 4) Criar constraint UNIQUE em phone
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_phone_key UNIQUE (phone);
