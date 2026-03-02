/**
 * Representa o resultado padronizado de uma operação.
 *
 * O resultado pode ser:
 * - sucesso → inclui `data`
 * - erro → inclui somente `message`
 *
 * @template T Tipo dos dados retornados em caso de sucesso.
 * @template E União de strings representando os códigos de erro possíveis.
 */
export type OperationResponse<T, E extends string = string> = Promise<
	| {
			success: true
			message: string
			data: T
	  }
	| {
			success: false
			message: string
			code?: E
	  }
>
