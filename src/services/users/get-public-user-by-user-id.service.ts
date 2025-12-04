import { getPublicUserByUserIdAdminRepo, PublicUserRow } from "@/repositories/public-users/public-users.admin.repo";
import { OperationResponse } from "@/types/operation-response";

export async function getPublicUserByUserIdService({ userId}: {userId: string}): Promise<OperationResponse<{user: PublicUserRow}>> {
  const { data: publicUserData, error: publicUserError } = await getPublicUserByUserIdAdminRepo({ userId })

  if (publicUserError || !publicUserData) {
    console.error("[getPublicUserByUserIdService] Não foi possível buscar dados do usuário(public.users):", publicUserError?.message)

    return {
      success: false,
      message: "Não foi possível buscar dados do usuário.",
    }
  }

  return {
    success: true,
    message: "Dados do usuário buscados com sucesso!",
    data: {
      user: publicUserData
    }
  }

}
