// src/types/toke.d.ts
import type { JWTPayload } from "jose"

export interface InviteTokenPayload extends JWTPayload {
  organizationId: string
  inviterUserId: string
  kind: "PUBLIC_JOIN_LINK"
}
