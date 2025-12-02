// src/lib/utils/token-utils.ts
import { jwtVerify, SignJWT } from "jose"

import type { InviteTokenPayload } from "@/types/token"

const rawSecret = process.env.INVITE_LINK_SECRET

if (!rawSecret) {
	throw new Error("INVITE_LINK_SECRET não configurada no .env")
}

const secret = new TextEncoder().encode(rawSecret)

export async function signInviteToken(payload: InviteTokenPayload, expiresIn: string | number = "7d") {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(expiresIn) // '7d', '2h', 3600, etc.
		.sign(secret)
}

/**
 * Lê e valida um token de convite.
 *
 * - Verifica assinatura (usando INVITE_LINK_SECRET)
 * - Verifica expiração (exp)
 * - Garante que o payload tem os campos esperados
 *
 * Retorna:
 *   - InviteTokenPayload válido, ou
 *   - null se inválido/expirado/malformado
 */
export async function verifyInviteToken(token: string): Promise<InviteTokenPayload | null> {
	try {
		const { payload } = await jwtVerify(token, secret)

		// Garantir em runtime que os campos esperados existem e têm o tipo certo
		if (typeof payload.organizationId !== "string" || typeof payload.inviterUserId !== "string" || payload.kind !== "PUBLIC_JOIN_LINK") {
			console.error("[verifyInviteToken] Payload com formato inválido:", payload)
			return null
		}

		// Aqui o TS ainda vê payload como JWTPayload, então fazemos o cast
		const invitePayload: InviteTokenPayload = {
			...(payload as object),
			organizationId: payload.organizationId,
			inviterUserId: payload.inviterUserId,
			kind: "PUBLIC_JOIN_LINK"
		} as InviteTokenPayload

		return invitePayload
	} catch (err) {
		// Pode ser token expirado, assinatura inválida, etc.
		console.error("[verifyInviteToken] Erro ao verificar token:", err)
		return null
	}
}
