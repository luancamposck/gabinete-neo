export type AppResult<T, E extends string = string> =
	| {
			success: true
			data: T
	  }
	| {
			success: false
			code: E
	  }

export type AppResultAsync<T, E extends string = string> = Promise<AppResult<T, E>>
