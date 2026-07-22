// @/modules/auth/server/services/create-user.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { CreateUserServiceCodes, CreateUserServiceData, CreateUserServiceParams } from "../../shared/types/slices/create-user.types"
import { createUserAdminRepo } from "../repos/create-user.admin.repo"

const prefixLog = "[createUserService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Registra um novo usuário com e-mail e senha.
 *
 * Responsabilidades:
 * - Executar a criação do usuário por meio do repositório de Auth Admin.
 * - Mapear erros conhecidos do Supabase Auth para códigos da aplicação.
 * - Retornar o ID do usuário criado em caso de sucesso.
 *
 * Observação:
 * - Esta service não cria registros em public.users/public.user_profiles.
 * - A sincronização com public.users e public.user_profiles é responsabilidade
 *   do trigger do banco (public.handle_new_auth_user()), a partir dos dados
 *   enviados em user_metadata.
 *
 * @param params - Dados usados para registrar o usuário.
 * @param params.name - Nome completo do usuário.
 * @param params.username - Username de usuário escolhido.
 * @param params.email - E-mail do usuário.
 * @param params.password - Senha definida para a conta.
 * @param params.phone - Telefone do usuário, somente dígitos com DDD.
 * @param params.cep - CEP do endereço, somente dígitos.
 * @param params.street - Logradouro do endereço.
 * @param params.number - Número do endereço.
 * @param params.complement - Complemento opcional do endereço.
 * @param params.neighborhood - Bairro do endereço.
 * @param params.city - Cidade do endereço.
 * @param params.state - Unidade federativa brasileira do endereço.
 *
 * @returns Uma resposta padronizada da operação contendo o id do usuário autenticado em caso de sucesso.
 */
export async function createUserService(params: CreateUserServiceParams): AppResultAsync<CreateUserServiceData, CreateUserServiceCodes> {
	try {
		const { data, error } = await createUserAdminRepo(params)

		/**
		 * O Supabase Auth retorna falhas esperadas do fluxo de cadastro por meio de `error`.
		 *
		 * O tratamento deve se basear em códigos de erro estáveis, e não em
		 * strings de mensagem, porque as mensagens podem mudar e não são ideais
		 * para controlar o fluxo da aplicação.
		 */
		if (error) {
			console.error(`${prefixLog} auth error`, {
				name: error.name,
				code: error.code,
				status: error.status
			})

			switch (error.code) {
				/**
				 * Indica que já existe uma conta registrada com o e-mail informado.
				 *
				 * A resposta mantém uma mensagem direta para orientar o usuário a
				 * recuperar acesso ou utilizar outro e-mail.
				 */
				case "email_exists":
				case "user_already_exists":
					return {
						success: false,
						code: "email_exists"
					}

				/**
				 * Retornado quando a senha não atende às regras mínimas de
				 * segurança exigidas pelo provedor de autenticação.
				 */
				case "weak_password":
					return {
						success: false,
						code: "weak_password"
					}

				/**
				 * Retornado quando o serviço limita temporariamente novas
				 * tentativas de cadastro ou envio de mensagens de verificação.
				 */
				case "over_request_rate_limit":
				case "over_email_send_rate_limit":
				case "over_sms_send_rate_limit":
					return {
						success: false,
						code: "rate_limit"
					}

				/**
				 * Retornado quando novos cadastros ou o provedor de e-mail/senha
				 * estão desabilitados nas configurações de autenticação.
				 */
				case "signup_disabled":
				case "email_provider_disabled":
					return {
						success: false,
						code: "signup_disabled"
					}

				default:
					return FALLBACK_ERROR
			}
		}

		/**
		 * Um cadastro bem-sucedido deve retornar o usuário recém-criado.
		 *
		 * A ausência de dados do usuário indica uma resposta inesperada de
		 * autenticação, então a operação é tratada como falha genérica.
		 */
		if (!data.user) {
			console.error(`${prefixLog} returned no user`, { data })
			return FALLBACK_ERROR
		}

		return {
			success: true,
			data: {
				userId: data.user.id
			}
		}
	} catch (error) {
		/**
		 * Trata falhas inesperadas em tempo de execução fora do contrato
		 * padrão `{ data, error }` do Supabase.
		 */
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}
