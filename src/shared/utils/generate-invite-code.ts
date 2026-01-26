// @/shared/utils/generate-invite-code.ts

import { randomBytes } from "node:crypto"

// Alfabeto “amigável”: sem 0/1/i/l/o (evita confusão visual)
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz"
const BASE = ALPHABET.length

export function generateInviteCode(length = 10) {
	const bytes = randomBytes(length)
	let out = ""

	for (let i = 0; i < length; i++) {
		out += ALPHABET[bytes[i] % BASE]
	}

	return out
}
