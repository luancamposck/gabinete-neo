import { headers } from "next/headers"

export async function getRequestHost(): Promise<string | null> {
	const h = await headers()
	const raw = h.get("x-forwarded-host") ?? h.get("host")
	if (!raw) return null

	const first = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)[0]

	if (!first) return null

	const host = first.toLowerCase().replace(/:\d+$/, "")
	return host || null
}
