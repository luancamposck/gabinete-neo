import { createHash, createHmac, randomUUID } from "node:crypto"
import { cookies, headers } from "next/headers"

const RESPONDER_COOKIE_NAME = "sr_rid"
const RESPONDER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2

function getFingerprintSecret(): string {
	const secret = process.env.SURVEY_FINGERPRINT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY
	if (!secret) {
		throw new Error("Missing SURVEY_FINGERPRINT_SECRET (or SUPABASE_SERVICE_ROLE_KEY fallback)")
	}

	return secret
}

function buildRotatingIpSalt(secret: string): string {
	const now = new Date()
	const year = now.getUTCFullYear()
	const month = String(now.getUTCMonth() + 1).padStart(2, "0")
	const day = String(now.getUTCDate()).padStart(2, "0")
	const dailyBucket = `${year}-${month}-${day}`

	return createHmac("sha256", secret).update(`ip-salt:${dailyBucket}`).digest("hex")
}

function extractRequestIp(rawForwardedFor: string | null): string | null {
	if (!rawForwardedFor) return null

	const firstIp = rawForwardedFor
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean)[0]

	if (!firstIp) return null
	return firstIp
}

function buildAuxiliarySignalHash(params: { requestIp: string | null; userAgent: string | null; secret: string }): string {
	const ipSalt = buildRotatingIpSalt(params.secret)
	const ipHash = params.requestIp ? createHash("sha256").update(`${ipSalt}:${params.requestIp}`).digest("hex") : "no-ip"
	const normalizedUserAgent = (params.userAgent ?? "no-ua").slice(0, 160)

	return createHash("sha256").update(`${ipHash}:${normalizedUserAgent}`).digest("hex")
}

export async function ensureStableResponderCookie(): Promise<string> {
	const cookieStore = await cookies()
	const existing = cookieStore.get(RESPONDER_COOKIE_NAME)?.value
	if (existing) return existing

	const newCookieId = randomUUID()
	cookieStore.set(RESPONDER_COOKIE_NAME, newCookieId, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: RESPONDER_COOKIE_MAX_AGE_SECONDS
	})

	return newCookieId
}

export async function buildResponderFingerprintHash(params: { surveyId: string; stableCookieId: string }): Promise<string> {
	const requestHeaders = await headers()
	const secret = getFingerprintSecret()
	const requestIp = extractRequestIp(requestHeaders.get("x-forwarded-for"))
	const userAgent = requestHeaders.get("user-agent")
	const auxiliarySignalHash = buildAuxiliarySignalHash({ requestIp, userAgent, secret })

	return createHmac("sha256", secret).update(`survey:${params.surveyId}|rid:${params.stableCookieId}|aux:${auxiliarySignalHash}`).digest("hex")
}
