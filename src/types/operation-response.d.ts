/**
 * Representa o resultado padronizado de uma operação.
 *
 * O resultado pode ser:
 * - sucesso → inclui `data`
 * - erro → inclui somente `message`
 *
 * @template T Tipo dos dados retornados em caso de sucesso.
 */
export type OperationResponse<T> =
	| {
			success: true
			message: string
			data: T
	  }
	| {
			success: false
			message: string
	  }
