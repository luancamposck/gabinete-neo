export function rethrowIfNextError(err: unknown): void {
	if (!err || typeof err !== "object") return

	const maybe = err as { digest?: unknown }
	if (typeof maybe.digest === "string") {
		throw err
	}
}
